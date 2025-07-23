import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 检查API密钥和服务提供商配置
    const apiKey = process.env.AI_API_KEY;
    const provider = process.env.AI_SERVICE_PROVIDER || 'openrouter';
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI服务密钥未配置' },
        { status: 500 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { input, intensity } = body;

    // 验证输入
    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json(
        { error: '请输入对方的话' },
        { status: 400 }
      );
    }

    if (!intensity || typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
      return NextResponse.json(
        { error: '强度值无效' },
        { status: 400 }
      );
    }

    // 生成提示词
    const prompt = generatePrompt(input.trim(), intensity);

    // 根据服务提供商选择API配置
    const apiConfig = getAPIConfig(provider, apiKey, prompt);
    
    if (!apiConfig) {
      return NextResponse.json(
        { error: `不支持的AI服务提供商: ${provider}` },
        { status: 400 }
      );
    }

    // 调用AI API
    const response = await fetch(apiConfig.url, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(apiConfig.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider} API错误:`, errorText);
      
      // 特殊处理积分不足的错误
      if (response.status === 402) {
        return NextResponse.json(
          { 
            error: `💳 账户积分不足，请前往 ${getProviderCreditURL(provider)} 充值`,
            details: '当前使用的AI服务需要付费积分。'
          },
          { status: 402 }
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { 
            error: `🔑 API密钥无效，请检查密钥格式是否正确`,
            details: `当前服务: ${provider}，密钥格式: ${getKeyFormatHint(provider)}`
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `API请求失败: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 根据不同提供商解析响应
    const replies = parseAIResponse(provider, data);
    
    if (replies.length === 0) {
      return NextResponse.json(
        { error: '没有收到有效回复' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      replies,
      timestamp: Date.now(),
      input: input.trim(),
      intensity,
      provider,
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

function getAPIConfig(provider: string, apiKey: string, prompt: string) {
  const systemMessage = '你是一个专业的沟通和辩论助手，擅长帮助用户进行有理有据的回应。你的回复要智慧、有逻辑、有说服力，但绝不能包含人身攻击或不当内容。';

  switch (provider.toLowerCase()) {
    case 'openrouter':
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://quarrel-winner.com',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'QuarrelWinner',
        } as Record<string, string>,
        body: {
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 800,
        }
      };

    case 'deepseek':
      return {
        url: 'https://api.deepseek.com/chat/completions',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        body: {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 800,
        }
      };

    case 'claude':
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        } as Record<string, string>,
        body: {
          model: 'claude-3-haiku-20240307',
          max_tokens: 800,
          messages: [
            { role: 'user', content: `${systemMessage}\n\n${prompt}` },
          ],
          temperature: 0.8,
        }
      };

    default:
      return null;
  }
}

function parseAIResponse(provider: string, data: any): string[] {
  switch (provider.toLowerCase()) {
    case 'openrouter':
    case 'deepseek':
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content;
        return parseRepliesFromContent(content);
      }
      break;

    case 'claude':
      if (data.content && data.content[0] && data.content[0].text) {
        const content = data.content[0].text;
        return parseRepliesFromContent(content);
      }
      break;
  }
  
  return [];
}

function parseRepliesFromContent(content: string): string[] {
  // 解析回复内容
  const replies = content
    .split('\n')
    .filter((line: string) => line.match(/^\d+\.\s/))
    .map((line: string) => line.replace(/^\d+\.\s/, '').trim())
    .filter((reply: string) => reply.length > 0);

  return replies.length > 0 ? replies.slice(0, 3) : ['回复生成失败，请重试'];
}

function getProviderCreditURL(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openrouter':
      return 'https://openrouter.ai/settings/credits';
    case 'deepseek':
      return 'https://platform.deepseek.com/usage';
    case 'claude':
      return 'https://console.anthropic.com/settings/billing';
    default:
      return '#';
  }
}

function getKeyFormatHint(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openrouter':
      return 'sk-or-v1-xxxxxx...';
    case 'deepseek':
      return 'sk-xxxxxx...';
    case 'claude':
      return 'sk-ant-api03-xxxxxx...';
    default:
      return 'sk-xxxxxx...';
  }
}

function generatePrompt(input: string, intensity: number): string {
  const getIntensityInstruction = (level: number) => {
    if (level <= 2) return '语气要温和友善，以理服人，避免任何冲突性言辞，重点在于沟通和理解';
    if (level <= 4) return '语气要礼貌但坚定，可以表达不同观点，但要保持尊重，重点在于讲道理';
    if (level <= 6) return '语气要据理力争，可以适当使用反问和对比，但要有理有据，重点在于逻辑反驳';
    if (level <= 8) return '语气要犀利有力，可以使用讽刺和强烈反驳，但要避免人身攻击，重点在于有力回击';
    return '语气要非常强烈，可以使用尖锐犀利的言辞进行反驳，但绝对不能人身攻击或使用脏话，重点在于气势压倒';
  };

  const getStyleInstruction = (level: number) => {
    if (level <= 2) return '温和理性，以事实和逻辑为主';
    if (level <= 4) return '坚定有礼，既有原则又有风度';
    if (level <= 6) return '据理力争，逻辑清晰且有说服力';
    if (level <= 8) return '犀利反击，言辞锋利但有理有据';
    return '气势如虹，用强烈的语气和犀利的逻辑压倒对方';
  };

  return `你是一个专业的辩论和沟通助手，用户想要回应别人的话。请为用户生成3条不同风格的回复。

用户输入的话："${input}"
语气强烈程度：${intensity}/10
语气要求：${getIntensityInstruction(intensity)}
风格要求：${getStyleInstruction(intensity)}

请生成3条回复，要求：
1. 每条回复都要针对性强，直击要害
2. 三条回复要有不同的角度和策略：
   - 第一条：逻辑反驳型（用事实和逻辑反驳）
   - 第二条：反问质疑型（用反问让对方思考）
   - 第三条：价值观输出型（表达自己的立场和价值观）
3. 每条回复控制在30-50字之间，简洁有力
4. 语言要符合中文表达习惯，自然流畅
5. 绝对不能包含人身攻击、脏话或不当内容
6. 要体现出智慧和修养，即使在强烈反驳时也要有理有据

请直接返回3条回复，用数字序号标注，格式如下：
1. [第一条回复]
2. [第二条回复]
3. [第三条回复]`;
}
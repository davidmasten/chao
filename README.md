# 🥊 吵架包赢 - AI助力争论神器

智能生成犀利回复，让你在每次争论中都能占据上风！

## 🌟 功能特点

- 🤖 **AI智能生成**：基于DeepSeek等先进AI模型
- 🎯 **针对性强**：根据对方话语生成精准回复
- 📊 **语气可调**：10级强度控制，从温和到核武级别
- 💡 **多角度策略**：逻辑反驳、反问质疑、价值观输出
- 📱 **响应式设计**：完美适配移动端和桌面端
- 📝 **历史记录**：保存最近10次生成记录

## 🛠️ 技术栈

- **前端框架**: Next.js 13 (App Router)
- **UI组件**: Shadcn/ui + Radix UI
- **样式**: Tailwind CSS
- **AI服务**: DeepSeek/OpenRouter/Claude
- **语言**: TypeScript

## 🚀 部署指南

### 1. Vercel部署（推荐）

1. **Fork本项目**
2. **登录Vercel**: https://vercel.com
3. **导入项目**: 选择你Fork的仓库
4. **配置环境变量**:
   ```
   AI_SERVICE_PROVIDER=deepseek
   AI_API_KEY=你的API密钥
   NEXT_PUBLIC_SITE_URL=https://你的域名.vercel.app
   NEXT_PUBLIC_SITE_NAME=QuarrelWinner
   ```
5. **点击Deploy**

### 2. Netlify部署

1. **连接GitHub仓库**
2. **构建设置**:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **环境变量配置**（同上）

### 3. Railway部署

1. **连接GitHub**
2. **选择仓库**
3. **配置环境变量**
4. **自动部署**

## 🔧 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd chao

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加你的API密钥

# 启动开发服务器
npm run dev
```

## 📋 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `AI_SERVICE_PROVIDER` | AI服务提供商 | `deepseek` / `openrouter` / `claude` |
| `AI_API_KEY` | AI服务API密钥 | `sk-xxxxxx...` |
| `NEXT_PUBLIC_SITE_URL` | 网站URL | `https://yoursite.com` |
| `NEXT_PUBLIC_SITE_NAME` | 网站名称 | `QuarrelWinner` |

## 🎯 支持的AI服务

### DeepSeek（推荐）
- **API端点**: `https://api.deepseek.com/chat/completions`
- **模型**: `deepseek-chat`
- **密钥格式**: `sk-xxxxxx...`
- **充值**: https://platform.deepseek.com/usage

### OpenRouter
- **API端点**: `https://openrouter.ai/api/v1/chat/completions`
- **模型**: `deepseek/deepseek-chat`
- **密钥格式**: `sk-or-v1-xxxxxx...`
- **充值**: https://openrouter.ai/settings/credits

### Claude
- **API端点**: `https://api.anthropic.com/v1/messages`
- **模型**: `claude-3-haiku-20240307`
- **密钥格式**: `sk-ant-api03-xxxxxx...`
- **充值**: https://console.anthropic.com/settings/billing

## 📱 使用方法

1. **输入对方的话**：在文本框中输入对方说的内容
2. **调节语气强度**：使用滑块选择1-10级的回复强度
3. **生成回复**：点击"开始吵架"按钮
4. **选择使用**：从3条生成的回复中选择合适的
5. **一键复制**：点击复制按钮快速复制内容

## 🔒 安全说明

- ✅ API密钥安全存储在服务端环境变量中
- ✅ 客户端无法访问敏感信息
- ✅ 所有API调用通过服务端代理
- ✅ 符合最佳安全实践

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**注意**: 本工具仅供娱乐和学习交流使用，请理性对待争论，倡导文明沟通。 # chao

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, MessageCircle, Zap, Volume2, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface QuarrelResponse {
  replies: string[];
  timestamp: number;
  input: string;
  intensity: number;
}

export default function Home() {
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState([5]);
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<QuarrelResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // 从localStorage加载历史记录
    const saved = localStorage.getItem('quarrel-history');
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    }
  }, []);

  const saveToHistory = (newResponse: QuarrelResponse) => {
    const updated = [newResponse, ...responses].slice(0, 10); // 只保留最近10条
    setResponses(updated);
    localStorage.setItem('quarrel-history', JSON.stringify(updated));
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "复制成功！",
        description: "回复内容已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制内容",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: "请输入对方的话",
        description: "需要知道对方说了什么才能帮你吵架哦！",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentResponse([]);

    try {
      // 调用安全的API路由
      const response = await fetch('/api/quarrel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input.trim(),
          intensity: intensity[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API请求失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.replies && Array.isArray(data.replies)) {
        setCurrentResponse(data.replies);
        
        const newResponse: QuarrelResponse = {
          replies: data.replies,
          timestamp: data.timestamp || Date.now(),
          input: input.trim(),
          intensity: intensity[0],
        };
        
        saveToHistory(newResponse);
        
        toast({
          title: "吵架神器已就绪！",
          description: "为你准备了3条犀利回复",
        });
      } else {
        throw new Error('没有收到有效回复');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : '请稍后再试，或检查网络连接';
      toast({
        title: "生成失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIntensityLabel = (value: number) => {
    if (value <= 2) return '温和友善';
    if (value <= 4) return '礼貌坚定';
    if (value <= 6) return '据理力争';
    if (value <= 8) return '犀利反击';
    return '核武级别';
  };

  const getIntensityColor = (value: number) => {
    if (value <= 2) return 'bg-green-500';
    if (value <= 4) return 'bg-blue-500';
    if (value <= 6) return 'bg-yellow-500';
    if (value <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getIntensityEmoji = (value: number) => {
    if (value <= 2) return '😊';
    if (value <= 4) return '🤔';
    if (value <= 6) return '😤';
    if (value <= 8) return '🔥';
    return '💥';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="text-center py-8">
          <div className="mb-4">
            <span className="text-6xl">🥊</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-3">
            吵架包赢
          </h1>
          <p className="text-green-600 text-lg md:text-xl font-medium mb-2">
            AI助力，让你在每次争论中都能占据上风
          </p>
          <p className="text-gray-500 text-sm">
            智能生成犀利回复，让你的每句话都有理有据
          </p>
        </div>

        {/* 主要输入区域 */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <MessageCircle className="w-6 h-6" />
              开始反击
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 输入框 */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                💬 对方说了什么？
              </label>
              <Textarea
                placeholder="输入对方的话，比如：'你这个人怎么这样？'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[140px] resize-none border-2 border-green-200 focus:border-green-500 text-base rounded-xl"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 text-right">
                {input.length}/500 字
              </div>
            </div>

            {/* 语气强烈程度 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  语气强烈程度
                </label>
                <Badge 
                  variant="secondary" 
                  className={`${getIntensityColor(intensity[0])} text-white px-3 py-1 text-sm font-medium`}
                >
                  {getIntensityEmoji(intensity[0])} {intensity[0]}/10 - {getIntensityLabel(intensity[0])}
                </Badge>
              </div>
              <div className="px-3">
                <Slider
                  value={intensity}
                  onValueChange={setIntensity}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>😊 温和</span>
                <span>🤔 礼貌</span>
                <span>😤 据理</span>
                <span>🔥 犀利</span>
                <span>💥 核武</span>
              </div>
            </div>

            {/* 提交按钮 */}
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  AI正在思考最佳回复...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  开始吵架 🚀
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 当前回复结果 */}
        {currentResponse.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Zap className="w-6 h-6" />
                AI为你准备的神级回复
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {currentResponse.map((reply, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-gradient-to-r from-white to-green-50 border-2 border-green-100 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-300"
                  >
                    <div className="flex items-start gap-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0 px-3 py-1 font-semibold">
                        方案 {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed text-base font-medium">{reply}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(reply, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-green-100"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 text-center">
                  💡 点击右侧复制按钮可以快速复制回复内容
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 历史记录 */}
        {responses.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessageCircle className="w-6 h-6" />
                历史记录 ({responses.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {responses.map((response, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-medium">
                        {getIntensityEmoji(response.intensity)} {getIntensityLabel(response.intensity)} ({response.intensity}/10)
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(response.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                      <p className="text-sm text-gray-600 font-medium">
                        对方说："{response.input}"
                      </p>
                    </div>
                    <div className="space-y-2">
                      {response.replies.map((reply, replyIndex) => (
                        <div
                          key={replyIndex}
                          className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500"
                        >
                          <Badge variant="secondary" className="bg-green-200 text-green-800 text-xs shrink-0">
                            {replyIndex + 1}
                          </Badge>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {reply}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 页脚 */}
        <div className="text-center py-6 text-gray-500 text-sm">
          <p>🤖 由先进AI技术驱动 | 让每次争论都有理有据</p>
        </div>
      </div>
    </div>
  );
}
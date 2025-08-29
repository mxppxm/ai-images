import React from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import { ImageGenerationService } from '@/services/imageService';
import { ImageGallery } from './ImageGallery';

export function ImageGenerator() {
  const {
    prompt,
    setPrompt,
    apiKey,
    selectedModel,
    imageSize,
    guidanceScale,
    isGenerating,
    setIsGenerating,
    addGeneratedImage,
    clearGeneratedImages,
    setIsSettingsOpen,
  } = useStore();

  const [error, setError] = React.useState<string>('');

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('请先在设置中配置API密钥');
      setIsSettingsOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const service = new ImageGenerationService(apiKey);
      const result = await service.generateImage({
        model: selectedModel.value,
        prompt: prompt.trim(),
        size: imageSize,
        guidance_scale: guidanceScale,
        response_format: 'url',
        watermark: true,
      });

      addGeneratedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI 文生图
          </h1>
          <p className="text-muted-foreground">使用豆包模型将文字描述转换为精美图像</p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="描述你想要生成的图像，例如：鱼眼镜头，一只猫咪的头部，画面呈现出猫咪的五官因为拍摄方式扭曲的效果..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  提示：按 Ctrl + Enter 快速生成
                </p>
              </div>

              {error && (
                <div className="px-3 py-2 bg-destructive/10 text-destructive rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? '生成中...' : '生成图像'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearGeneratedImages}
                  disabled={isGenerating}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  清空
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <ImageGallery />
      </div>
    </div>
  );
}

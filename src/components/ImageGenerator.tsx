import React from "react";
import {
  Sparkles,
  Trash2,
  Download,
  Wand2,
  Video,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { ImageGenerationService } from "@/services/imageService";
import { ImageGallery } from "./ImageGallery";
import { ImageSelector } from "./ImageSelector";
import { ImageEditor } from "./ImageEditor";
import { VideoGenerator } from "./VideoGenerator";
// import { ComingSoonNotice } from "./ComingSoonNotice";
import { useImageProxy } from "@/hooks/useImageProxy";
import type { GeneratedImage } from "@/types";

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
    generatedImages,
    workMode,
    setWorkMode,
    selectedImageForEdit,
    setSelectedImageForEdit,
  } = useStore();

  const { convertToProxy } = useImageProxy();
  const [error, setError] = React.useState<string>("");
  const [selectedImage, setSelectedImage] =
    React.useState<GeneratedImage | null>(null);

  // 获取最新生成的图片
  const latestImage = generatedImages.length > 0 ? generatedImages[0] : null;

  // 下载图片功能
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("请先在设置中配置API密钥");
      setIsSettingsOpen(true);
      return;
    }

    if (!prompt.trim()) {
      setError("请输入提示词");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const service = new ImageGenerationService(apiKey);
      const result = await service.generateImage({
        model: selectedModel.value,
        prompt: prompt.trim(),
        size: imageSize,
        guidance_scale: guidanceScale,
        response_format: "url",
        watermark: false,
      });

      // 添加原始用户输入的提示词
      const imageWithPrompt = {
        ...result,
        original_prompt: prompt.trim(),
      };

      addGeneratedImage(imageWithPrompt);

      // 生成成功后清空输入框
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {workMode === "text-to-image"
              ? "AI 文生图"
              : workMode === "image-to-image"
              ? "AI 图像编辑"
              : workMode === "text-to-video"
              ? "AI 文生视频"
              : "AI 图生视频"}
          </h1>
          <p className="text-muted-foreground">
            {workMode === "text-to-image"
              ? "使用豆包模型将文字描述转换为精美图像"
              : workMode === "image-to-image"
              ? "通过对话不断优化和编辑图像"
              : workMode === "text-to-video"
              ? "使用文字描述生成精彩视频"
              : "将图像转换为动态视频"}
          </p>

          {/* 模式切换按钮 */}
          <div className="flex justify-center mt-6">
            <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-1 rounded-lg border p-1 bg-muted">
              <Button
                variant={workMode === "text-to-image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setWorkMode("text-to-image")}
                className="rounded-md"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                文生图
              </Button>
              <Button
                variant={workMode === "image-to-image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setWorkMode("image-to-image")}
                className="rounded-md"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                图编辑
              </Button>
              <Button
                variant={workMode === "text-to-video" ? "default" : "ghost"}
                size="sm"
                onClick={() => setWorkMode("text-to-video")}
                className="rounded-md"
              >
                <Video className="mr-2 h-4 w-4" />
                文生视频
              </Button>
              <Button
                variant={workMode === "image-to-video" ? "default" : "ghost"}
                size="sm"
                onClick={() => setWorkMode("image-to-video")}
                className="rounded-md"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                图生视频
              </Button>
            </div>
          </div>
        </div>

        {/* 根据模式显示不同的内容 */}
        {workMode === "text-to-image" ? (
          <>
            {/* 最新生成的图片展示区域 */}
            {latestImage && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-green-600">
                    ✨ 刚刚生成
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImageForEdit(latestImage);
                        setWorkMode("image-to-image");
                      }}
                    >
                      <Wand2 className="mr-2 h-4 w-4" />
                      编辑此图
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        latestImage.url && handleDownload(latestImage.url)
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Card className="overflow-hidden group relative max-w-md">
                    <div className="aspect-square relative">
                      <img
                        src={convertToProxy(latestImage.url)}
                        alt="Latest generated image"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => setSelectedImage(latestImage)}
                      />
                    </div>
                    {(latestImage.original_prompt ||
                      latestImage.revised_prompt) && (
                      <div className="p-3 border-t">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {latestImage.original_prompt ||
                            latestImage.revised_prompt}
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

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
                      提示：按 Enter 生成图像，Shift + Enter 换行
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
                      {isGenerating ? "生成中..." : "生成图像"}
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
          </>
        ) : workMode === "image-to-image" ? (
          <>
            {/* 图像编辑模式 */}
            {!selectedImageForEdit ? <ImageSelector /> : <ImageEditor />}
          </>
        ) : (
          <>
            {/* 视频生成模式 */}
            <VideoGenerator />
          </>
        )}

        {/* 图片预览模态框 */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            {selectedImage && (
              <div className="flex flex-col h-full">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="text-xl font-semibold">
                    图片详情
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <img
                      src={convertToProxy(selectedImage.url)}
                      alt="Selected image"
                      className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                    />
                  </div>

                  {(selectedImage.original_prompt ||
                    selectedImage.revised_prompt) && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                      {selectedImage.original_prompt && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-2">
                            输入提示词：
                          </h3>
                          <p className="text-sm leading-relaxed">
                            {selectedImage.original_prompt}
                          </p>
                        </div>
                      )}
                      {selectedImage.revised_prompt &&
                        selectedImage.revised_prompt !==
                          selectedImage.original_prompt && (
                          <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-2">
                              AI优化提示词：
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground/80">
                              {selectedImage.revised_prompt}
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() =>
                        selectedImage.url && handleDownload(selectedImage.url)
                      }
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      下载图片
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedImage(null)}
                    >
                      关闭
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

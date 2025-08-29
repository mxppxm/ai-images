import React from "react";
import {
  Download,
  Loader2,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/store/useStore";
import { useImageProxy } from "@/hooks/useImageProxy";
import type { GeneratedImage } from "@/types";

export function ImageGallery() {
  const {
    generatedImages,
    isGenerating,
    isHistoryExpanded,
    setIsHistoryExpanded,
  } = useStore();
  const { convertToProxy } = useImageProxy();
  const [selectedImage, setSelectedImage] =
    React.useState<GeneratedImage | null>(null);
  const [showPromptDialog, setShowPromptDialog] = React.useState(false);

  // 当关闭图片弹窗时，同时关闭提示词弹窗
  React.useEffect(() => {
    if (!selectedImage) {
      setShowPromptDialog(false);
    }
  }, [selectedImage]);

  // 截断文本用于预览
  const truncateText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (generatedImages.length === 0 && !isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">暂无生成的图片</p>
        <p className="text-sm text-muted-foreground mt-2">
          输入提示词并点击生成按钮开始
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 历史记录标题和展开收起按钮 */}
      {generatedImages.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            生成记录 ({generatedImages.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="flex items-center gap-2"
          >
            {isHistoryExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                展开
              </>
            )}
          </Button>
        </div>
      )}

      {/* 图片网格 */}
      {isHistoryExpanded && generatedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedImages.map((image, index) => (
            <Card key={index} className="overflow-hidden group relative">
              <div className="aspect-square relative">
                <img
                  src={convertToProxy(image.url)}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setSelectedImage(image)}
                />

                {/* 下载按钮 - 右上角 */}
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    image.url && handleDownload(image.url, index);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              {(image.original_prompt || image.revised_prompt) && (
                <div className="p-3 border-t">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {image.original_prompt || image.revised_prompt}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 图片查看模态框 */}
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
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm text-muted-foreground">
                            输入提示词：
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPromptDialog(true)}
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            查看详情
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {truncateText(selectedImage.original_prompt)}
                        </p>
                      </div>
                    )}
                    {selectedImage.revised_prompt &&
                      selectedImage.revised_prompt !==
                        selectedImage.original_prompt && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm text-muted-foreground">
                              AI优化提示词：
                            </h3>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground/80">
                            {truncateText(selectedImage.revised_prompt)}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() =>
                      selectedImage.url && handleDownload(selectedImage.url, 0)
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

      {/* 提示词详情弹窗 */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>提示词详情</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto">
            {selectedImage?.original_prompt && (
              <div>
                <h3 className="font-medium text-base text-foreground mb-3">
                  输入提示词
                </h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedImage.original_prompt}
                  </p>
                </div>
              </div>
            )}

            {selectedImage?.revised_prompt &&
              selectedImage.revised_prompt !==
                selectedImage.original_prompt && (
                <div>
                  <h3 className="font-medium text-base text-foreground mb-3">
                    AI优化提示词
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-wrap">
                      {selectedImage.revised_prompt}
                    </p>
                  </div>
                </div>
              )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowPromptDialog(false)}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

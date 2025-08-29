import React from "react";
import { ArrowLeft, Edit3, Sparkles, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { ImageGenerationService } from "@/services/imageService";
import { useImageProxy } from "@/hooks/useImageProxy";
import type { GeneratedImage } from "@/types";

export function ImageEditor() {
  const {
    selectedImageForEdit,
    setSelectedImageForEdit,
    setWorkMode,
    apiKey,
    selectedModel,
    imageSize,
    guidanceScale,
    addGeneratedImage,
    setIsSettingsOpen,
  } = useStore();
  const { convertToProxy, convertToOriginal } = useImageProxy();

  const [editPrompt, setEditPrompt] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editHistory, setEditHistory] = React.useState<GeneratedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // 当选中的图片改变时，重置编辑历史
  React.useEffect(() => {
    if (selectedImageForEdit) {
      setEditHistory([selectedImageForEdit]);
      setCurrentImageIndex(0);
      setEditPrompt("");
      setError("");
    }
  }, [selectedImageForEdit]);

  const currentImage = editHistory[currentImageIndex] || selectedImageForEdit;

  const handleEdit = async () => {
    if (!apiKey) {
      setError("请先在设置中配置API密钥");
      setIsSettingsOpen(true);
      return;
    }

    if (!editPrompt.trim()) {
      setError("请输入编辑指令");
      return;
    }

    if (!currentImage?.url) {
      setError("请选择要编辑的图片");
      return;
    }

    setError("");
    setIsEditing(true);

    try {
      const service = new ImageGenerationService(apiKey);

      // 确保传递原始URL给API（不是代理URL）
      const originalUrl = convertToOriginal(currentImage.url);
      console.log("传递给API的URL:", originalUrl);

      const result = await service.editImage({
        model: selectedModel.value,
        image: originalUrl,
        prompt: editPrompt.trim(),
        size: imageSize,
        guidance_scale: guidanceScale,
        response_format: "url",
        watermark: false,
      });

      // 添加编辑指令信息
      const editedImage = {
        ...result,
        original_prompt: `${
          currentImage.original_prompt || ""
        } → ${editPrompt.trim()}`,
        edit_prompt: editPrompt.trim(),
      };

      // 添加到编辑历史
      const newHistory = [
        ...editHistory.slice(0, currentImageIndex + 1),
        editedImage,
      ];
      setEditHistory(newHistory);
      setCurrentImageIndex(newHistory.length - 1);

      // 同时添加到全局生成记录
      addGeneratedImage(editedImage);

      // 清空输入框
      setEditPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "编辑失败，请重试");
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isEditing) {
      e.preventDefault();
      handleEdit();
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const canGoBack = currentImageIndex > 0;
  const canGoForward = currentImageIndex < editHistory.length - 1;

  if (!selectedImageForEdit) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedImageForEdit(null);
              setWorkMode("text-to-image");
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <Edit3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">图像编辑</h2>
        </div>

        {/* 版本控制 */}
        {editHistory.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoBack}
              onClick={() =>
                setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
              }
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              版本 {currentImageIndex + 1}/{editHistory.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoForward}
              onClick={() =>
                setCurrentImageIndex(
                  Math.min(editHistory.length - 1, currentImageIndex + 1)
                )
              }
            >
              <RotateCcw className="h-4 w-4 scale-x-[-1]" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：图片显示 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square relative bg-black rounded-lg overflow-hidden">
                <img
                  src={convertToProxy(currentImage?.url || "")}
                  alt="编辑中的图片"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">当前版本</p>
                  {currentImage?.edit_prompt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      最后编辑：{currentImage.edit_prompt}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    currentImage?.url && handleDownload(currentImage.url)
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 编辑历史缩略图 */}
          {editHistory.length > 1 && (
            <div>
              <p className="text-sm font-medium mb-2">编辑历史</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {editHistory.map((image, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={convertToProxy(image.url)}
                      alt={`版本 ${index + 1}`}
                      className="w-16 h-16 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：编辑控制 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    编辑指令
                  </label>
                  <Textarea
                    placeholder="描述你想要的修改，例如：把天空改成夜空，添加星星..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[100px] resize-none"
                    disabled={isEditing}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    提示：按 Enter 开始编辑，Shift + Enter 换行
                  </p>
                </div>

                {error && (
                  <div className="px-3 py-2 bg-destructive/10 text-destructive rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleEdit}
                  disabled={isEditing || !editPrompt.trim()}
                  className="w-full"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isEditing ? "编辑中..." : "应用编辑"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 原始图片信息 */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">原始图片信息</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">提示词：</span>
                  <p className="mt-1 text-xs bg-muted p-2 rounded">
                    {selectedImageForEdit.original_prompt || "无"}
                  </p>
                </div>
                {selectedImageForEdit.revised_prompt && (
                  <div>
                    <span className="text-muted-foreground">
                      AI优化提示词：
                    </span>
                    <p className="mt-1 text-xs bg-muted/50 p-2 rounded">
                      {selectedImageForEdit.revised_prompt}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

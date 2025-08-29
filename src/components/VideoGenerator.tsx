import React from "react";
import { Video, PlayCircle, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/store/useStore";
import { VideoGenerationService } from "@/services/videoService";
import { VideoGallery } from "./VideoGallery";
import { ImageSelector } from "./ImageSelector";
import { useImageProxy } from "@/hooks/useImageProxy";
import type { GeneratedVideo } from "@/types";

export function VideoGenerator() {
  const {
    prompt,
    setPrompt,
    apiKey,
    selectedVideoModel,
    isGeneratingVideo,
    setIsGeneratingVideo,
    addGeneratedVideo,
    updateVideoStatus,
    clearGeneratedVideos,
    setIsSettingsOpen,
    generatedVideos,
    workMode,
    selectedImageForVideo,
    setSelectedImageForVideo,
  } = useStore();

  const [error, setError] = React.useState<string>("");
  const [currentProgress, setCurrentProgress] = React.useState<number>(0);
  const { convertToOriginal } = useImageProxy();

  // 获取最新生成的视频
  const latestVideo = generatedVideos.length > 0 ? generatedVideos[0] : null;

  // 下载视频功能
  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download video:", error);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("请先在设置中配置API密钥");
      setIsSettingsOpen(true);
      return;
    }

    if (workMode === "text-to-video" && !prompt.trim()) {
      setError("请输入视频描述");
      return;
    }

    if (workMode === "image-to-video" && !selectedImageForVideo) {
      setError("请先选择一张图片");
      return;
    }

    setError("");
    setIsGeneratingVideo(true);
    setCurrentProgress(0);

    try {
      const service = new VideoGenerationService(apiKey);
      let video: GeneratedVideo;

      if (workMode === "text-to-video") {
        video = await service.generateTextToVideo(
          prompt.trim(),
          selectedVideoModel.value
        );
      } else {
        // 获取原始URL，而不是代理URL
        const originalUrl = convertToOriginal(selectedImageForVideo!.url!);
        console.log("图生视频 - 原始图片URL:", originalUrl);
        console.log("图生视频 - 存储的图片URL:", selectedImageForVideo!.url!);

        video = await service.generateImageToVideo(
          originalUrl,
          prompt.trim() || "将图像转换为视频",
          selectedVideoModel.value
        );
      }

      console.log("✅ 任务创建成功，开始处理 - 任务ID:", video.task_id);

      // 立即开始轮询，不等待其他操作
      console.log(
        "🚀 立即开始轮询任务状态 - URL将是:",
        `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/${video.task_id}`
      );

      // 异步添加到状态，不阻塞轮询
      addGeneratedVideo(video).catch((addError) => {
        console.error("添加视频到状态失败:", addError);
      });

      // 开始轮询
      const result = await service.pollVideoTask(video.task_id, (progress) => {
        console.log("📊 进度更新:", progress);
        setCurrentProgress(progress);
        updateVideoStatus(video.task_id, { progress });
      });

      console.log("✅ 轮询完成 - 最终结果:", result);

      // 更新最终状态
      updateVideoStatus(video.task_id, {
        status: result.status,
        video_url: result.video_url,
        error_message: result.error_message,
      });

      if (result.status === "completed" || result.status === "succeeded") {
        console.log("🎉 视频生成成功!");
        setPrompt("");
        if (workMode === "image-to-video") {
          setSelectedImageForVideo(null);
        }
      } else if (result.status === "failed") {
        console.error("❌ 视频生成失败:", result.error_message);
        setError(result.error_message || "视频生成失败");
      }
    } catch (err) {
      console.error("视频生成过程中发生错误:", err);
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      console.log("视频生成流程结束，重置状态");
      setIsGeneratingVideo(false);
      setCurrentProgress(0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isGeneratingVideo) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const canGenerate =
    workMode === "text-to-video" ? prompt.trim() : selectedImageForVideo;

  return (
    <div className="space-y-6">
      {/* 最新生成的视频展示区域 */}
      {latestVideo &&
        (latestVideo.status === "completed" ||
          latestVideo.status === "succeeded") &&
        latestVideo.video_url && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-600">
                ✨ 刚刚生成
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(latestVideo.video_url!)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="overflow-hidden max-w-md">
                <div className="aspect-video relative">
                  <video
                    src={latestVideo.video_url}
                    controls
                    className="w-full h-full object-cover"
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
                {latestVideo.original_prompt && (
                  <div className="p-3 border-t">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {latestVideo.original_prompt}
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

      {/* 图生视频的图片选择器 */}
      {workMode === "image-to-video" && !selectedImageForVideo && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">选择源图片</h3>
            <ImageSelector
              onImageSelect={setSelectedImageForVideo}
              title="请选择要生成视频的图片"
            />
          </CardContent>
        </Card>
      )}

      {/* 已选择的图片展示 */}
      {workMode === "image-to-video" && selectedImageForVideo && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">选择的图片</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedImageForVideo(null)}
              >
                重新选择
              </Button>
            </div>
            <div className="flex justify-center">
              <div className="max-w-xs">
                <img
                  src={selectedImageForVideo.url}
                  alt="Selected for video"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder={
                  workMode === "text-to-video"
                    ? "描述你想要生成的视频，例如：多个镜头。一名侦探进入一间光线昏暗的房间。他检查桌上的线索，手里拿起桌上的某个物品。镜头转向他正在思索。 --ratio 16:9"
                    : "描述如何将图片转换为视频（可选）"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[120px] resize-none"
                disabled={isGeneratingVideo}
              />
              <p className="text-xs text-muted-foreground mt-2">
                提示：按 Enter 生成视频，Shift + Enter 换行
              </p>
            </div>

            {/* 生成进度 */}
            {isGeneratingVideo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    生成进度
                  </span>
                  <span className="text-sm font-medium">
                    {currentProgress}%
                  </span>
                </div>
                <Progress value={currentProgress} className="w-full" />
              </div>
            )}

            {error && (
              <div className="px-3 py-2 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGeneratingVideo || !canGenerate}
                className="flex-1"
              >
                {workMode === "text-to-video" ? (
                  <Video className="mr-2 h-4 w-4" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                {isGeneratingVideo
                  ? "生成中..."
                  : workMode === "text-to-video"
                  ? "生成视频"
                  : "生成视频"}
              </Button>
              <Button
                variant="outline"
                onClick={clearGeneratedVideos}
                disabled={isGeneratingVideo}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <VideoGallery />
    </div>
  );
}

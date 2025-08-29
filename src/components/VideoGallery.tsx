import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Progress } from "@/components/ui/progress";
import type { GeneratedVideo } from "@/types";

export function VideoGallery() {
  const { generatedVideos, isHistoryExpanded, setIsHistoryExpanded } =
    useStore();
  const [selectedVideo, setSelectedVideo] =
    React.useState<GeneratedVideo | null>(null);

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

  // 获取状态图标和颜色
  const getStatusIcon = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
      case "succeeded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: GeneratedVideo["status"]) => {
    switch (status) {
      case "pending":
        return "等待中";
      case "processing":
        return "处理中";
      case "completed":
      case "succeeded":
        return "已完成";
      case "failed":
        return "失败";
      default:
        return "未知";
    }
  };

  if (generatedVideos.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
        >
          <h3 className="text-lg font-semibold">
            视频历史 ({generatedVideos.length})
          </h3>
          {isHistoryExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>

        {isHistoryExpanded && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedVideos.map((video, index) => (
                <Card
                  key={video.task_id}
                  className="overflow-hidden group relative cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    (video.status === "completed" ||
                      video.status === "succeeded") &&
                    video.video_url &&
                    setSelectedVideo(video)
                  }
                >
                  <div className="aspect-video relative bg-black">
                    {(video.status === "completed" ||
                      video.status === "succeeded") &&
                    video.video_url ? (
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                        onMouseEnter={(e) =>
                          (e.target as HTMLVideoElement).play()
                        }
                        onMouseLeave={(e) =>
                          (e.target as HTMLVideoElement).pause()
                        }
                      >
                        您的浏览器不支持视频播放。
                      </video>
                    ) : video.original_image_url ? (
                      <img
                        src={video.original_image_url}
                        alt="Source for video"
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <span className="text-muted-foreground">
                          视频生成中
                        </span>
                      </div>
                    )}

                    {/* 状态覆盖层 */}
                    {video.status !== "completed" &&
                      video.status !== "succeeded" && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                          <div className="text-white text-center space-y-2">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(video.status)}
                              <span className="text-sm font-medium">
                                {getStatusText(video.status)}
                              </span>
                            </div>
                            {video.status === "processing" &&
                              video.progress !== undefined && (
                                <div className="w-32">
                                  <Progress
                                    value={video.progress}
                                    className="h-1"
                                  />
                                  <p className="text-xs mt-1">
                                    {video.progress}%
                                  </p>
                                </div>
                              )}
                            {video.status === "failed" &&
                              video.error_message && (
                                <p className="text-xs text-red-300 max-w-xs">
                                  {video.error_message}
                                </p>
                              )}
                          </div>
                        </div>
                      )}

                    {/* 悬停时显示的操作按钮 */}
                    {(video.status === "completed" ||
                      video.status === "succeeded") &&
                      video.video_url && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(video.video_url!);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                  </div>

                  {/* 视频信息 */}
                  <div className="p-3 border-t space-y-2">
                    {video.original_prompt && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {video.original_prompt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(video.created_at).toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(video.status)}
                        <span className="text-xs">
                          {getStatusText(video.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* 视频预览模态框 */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">视频详情</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVideo(null)}
                >
                  关闭
                </Button>
              </div>

              {/* 视频播放器 */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={selectedVideo.video_url}
                  controls
                  className="w-full h-full"
                  autoPlay
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>

              {/* 视频信息 */}
              {selectedVideo.original_prompt && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    提示词：
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selectedVideo.original_prompt}
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    selectedVideo.video_url &&
                    handleDownload(selectedVideo.video_url)
                  }
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载视频
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

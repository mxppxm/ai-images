import type {
  GenerateVideoRequest,
  VideoTaskResponse,
  GeneratedVideo,
} from "@/types";
import axios from "axios";

// 根据环境变量决定API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DOUBAO_VIDEO_API_URL = `${API_BASE_URL}/api/v3/contents/generations/tasks`;

export class VideoGenerationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 创建视频生成任务
  async generateVideo(
    request: GenerateVideoRequest
  ): Promise<VideoTaskResponse> {
    try {
      const response = await axios.post(
        DOUBAO_VIDEO_API_URL,
        {
          model: request.model,
          content: request.content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log("生成视频任务 - 响应状态:", response.status);
      console.log("生成视频任务 - 响应数据:", response.data);

      // 根据实际响应格式处理
      if (response.data) {
        const taskId = response.data.task_id || response.data.id;
        if (taskId) {
          console.log("成功创建视频任务 - 任务ID:", taskId);
          return {
            task_id: taskId,
            status: "pending",
          };
        }
      }

      console.error("无效的API响应:", response.data);
      throw new Error("Invalid response from API");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("API密钥无效，请检查您的设置");
        }
        if (error.response?.data?.error?.message) {
          throw new Error(error.response.data.error.message);
        }
      }
      throw new Error("创建视频生成任务失败，请稍后重试");
    }
  }

  // 查询视频生成任务状态
  async queryVideoTask(taskId: string): Promise<VideoTaskResponse> {
    try {
      console.log("查询任务状态 - 任务ID:", taskId);
      console.log(
        "查询任务状态 - 请求URL:",
        `${DOUBAO_VIDEO_API_URL}/${taskId}`
      );

      const response = await axios.get(`${DOUBAO_VIDEO_API_URL}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      console.log("查询任务状态 - 响应状态:", response.status);
      console.log("查询任务状态 - 响应数据:", response.data);

      if (response.data) {
        // 获取状态，将 "succeeded" 映射为 "completed"
        let status =
          response.data.status || response.data.task_status || "pending";
        if (status === "succeeded") {
          status = "completed";
        }

        // 获取视频URL，检查多个可能的位置
        const video_url =
          response.data.content?.video_url || // 新格式：在content里
          response.data.video_url || // 旧格式：在根级别
          response.data.output?.video_url; // 备用格式

        const result = {
          task_id: taskId,
          status,
          video_url,
          progress: response.data.progress,
          error_message: response.data.error_message || response.data.message,
        };

        console.log("查询任务状态 - 解析结果:", result);
        return result;
      }

      throw new Error("Invalid response from API");
    } catch (error) {
      console.error("查询任务状态 - 错误详情:", error);

      if (axios.isAxiosError(error)) {
        console.error("查询任务状态 - 响应状态码:", error.response?.status);
        console.error("查询任务状态 - 响应数据:", error.response?.data);

        if (error.response?.status === 401) {
          throw new Error("API密钥无效，请检查您的设置");
        }
        if (error.response?.status === 404) {
          throw new Error("任务不存在或已过期");
        }
        if (error.response?.data?.error?.message) {
          throw new Error(error.response.data.error.message);
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error("查询任务状态失败，请稍后重试");
    }
  }

  // 轮询任务状态直到完成
  async pollVideoTask(
    taskId: string,
    onProgress?: (progress: number) => void,
    maxAttempts: number = 60, // 最多轮询5分钟（每5秒一次）
    interval: number = 5000 // 轮询间隔5秒
  ): Promise<VideoTaskResponse> {
    let attempts = 0;
    console.log(
      `开始轮询任务 ${taskId}，最多尝试 ${maxAttempts} 次，间隔 ${interval}ms`
    );

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`第 ${attempts}/${maxAttempts} 次查询任务状态`);

      try {
        const result = await this.queryVideoTask(taskId);

        // 调用进度回调 - 由于API不返回具体进度，我们模拟进度
        if (onProgress) {
          if (result.status === "processing") {
            // 模拟进度：处理中时显示随机进度
            const simulatedProgress = Math.min(90, 10 + attempts * 2);
            onProgress(simulatedProgress);
          } else if (
            result.status === "completed" ||
            result.status === "succeeded"
          ) {
            onProgress(100);
          }
        }

        // 如果任务完成或失败，返回结果
        if (
          result.status === "completed" ||
          result.status === "succeeded" ||
          result.status === "failed"
        ) {
          console.log(
            `✅ 任务${result.status === "failed" ? "失败" : "完成"} - 状态: ${
              result.status
            }`
          );
          return result;
        }

        // 等待指定间隔后继续轮询
        console.log(`任务仍在处理中，${interval}ms后继续查询...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`第${attempts}次查询失败:`, error);
        // 如果是网络错误，继续重试
        if (attempts >= maxAttempts) {
          console.error("达到最大重试次数，停止轮询");
          throw error;
        }
        console.log(`查询失败，${interval}ms后重试...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error("视频生成超时，请稍后查看结果");
  }

  // 工具方法：将图片URL转换为完整的Data URI格式（用于图生视频）
  async urlToDataUri(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUri = reader.result as string;
          // 返回完整的 data:image/...;base64,... 格式
          resolve(dataUri);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error("转换图片格式失败");
    }
  }

  // 工具方法：将图片URL转换为base64（兼容旧接口）
  async urlToBase64(url: string): Promise<string> {
    try {
      const dataUri = await this.urlToDataUri(url);
      // 移除 data:image/...;base64, 前缀，只返回base64数据
      const base64Data = dataUri.split(",")[1];
      return base64Data;
    } catch (error) {
      throw new Error("转换图片格式失败");
    }
  }

  // 文生视频
  async generateTextToVideo(
    prompt: string,
    model: string
  ): Promise<GeneratedVideo> {
    const taskResponse = await this.generateVideo({
      model,
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    });

    return {
      task_id: taskResponse.task_id,
      original_prompt: prompt,
      status: "pending",
      created_at: Date.now(),
    };
  }

  // 图生视频
  async generateImageToVideo(
    imageUrl: string,
    prompt: string,
    model: string
  ): Promise<GeneratedVideo> {
    // 图生视频的内容格式
    const content: Array<{
      type: "text" | "image";
      text?: string;
      image?: string;
    }> = [];

    // 尝试使用原始URL，如果失败则转换为base64
    try {
      console.log("图生视频使用原始URL:", imageUrl);

      // 检查URL是否可访问
      if (imageUrl.startsWith("http")) {
        // 对于HTTP/HTTPS URL，直接使用
        content.push({
          type: "image",
          image: imageUrl,
        });
      } else {
        // 对于其他格式，转换为Data URI
        console.log("非HTTP URL，转换为Data URI");
        const imageDataUri = await this.urlToDataUri(imageUrl);
        content.push({
          type: "image",
          image: imageDataUri,
        });
      }
    } catch (error) {
      console.error("使用原始URL失败，尝试转换为Data URI:", error);
      try {
        const imageDataUri = await this.urlToDataUri(imageUrl);
        content.push({
          type: "image",
          image: imageDataUri,
        });
      } catch (fallbackError) {
        console.error("Data URI转换也失败:", fallbackError);
        throw new Error(
          `图片处理失败: ${
            fallbackError instanceof Error ? fallbackError.message : "未知错误"
          }`
        );
      }
    }

    // 添加文本描述（如果有）
    if (prompt && prompt.trim()) {
      content.push({
        type: "text",
        text: prompt.trim(),
      });
    }

    console.log("图生视频请求内容:", {
      model,
      content: content.map((item) => ({
        ...item,
        image: item.image
          ? item.image.length > 100
            ? `${item.image.substring(0, 100)}...`
            : item.image
          : undefined,
      })),
    });

    const taskResponse = await this.generateVideo({
      model,
      content,
    });

    return {
      task_id: taskResponse.task_id,
      original_prompt: prompt,
      original_image_url: imageUrl,
      status: "pending",
      created_at: Date.now(),
    };
  }
}

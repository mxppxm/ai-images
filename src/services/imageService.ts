import type {
  GenerateImageRequest,
  EditImageRequest,
  GeneratedImage,
} from "@/types";
import axios from "axios";

// 根据环境变量决定API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DOUBAO_GENERATE_API_URL = `${API_BASE_URL}/api/v3/images/generations`;
// 图像编辑API端点 - 与文生图使用相同端点
const DOUBAO_EDIT_API_URL = `${API_BASE_URL}/api/v3/images/generations`;

// 图片URL代理转换函数
const convertImageUrlToProxy = (url: string): string => {
  console.log("原始图片URL:", url); // 调试日志

  if (!url) return url;

  // 检查是否是豆包图片存储URL
  const imageStorageDomain =
    "ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com";

  if (url.includes(imageStorageDomain)) {
    // 转换为代理URL
    const path = url.replace(`https://${imageStorageDomain}`, "");
    const proxyUrl = `${API_BASE_URL}/image-proxy${path}`;
    console.log("转换后的代理URL:", proxyUrl);
    return proxyUrl;
  }

  // 如果不是标准域名，直接返回原URL（可能已经是正确格式）
  console.log("未匹配域名，直接返回:", url);
  return url;
};

export class ImageGenerationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: GenerateImageRequest): Promise<GeneratedImage> {
    try {
      const response = await axios.post(
        DOUBAO_GENERATE_API_URL,
        {
          model: request.model,
          prompt: request.prompt,
          response_format: request.response_format || "url",
          size: request.size || "1024x1024",
          guidance_scale: request.guidance_scale || 3,
          watermark: request.watermark ?? false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.data[0]) {
        const imageData = response.data.data[0];
        return {
          url: imageData.url, // 保存原始URL，便于API调用和后续编辑
          b64_json: imageData.b64_json,
          revised_prompt: imageData.revised_prompt,
        };
      }

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
      throw new Error("生成图像失败，请稍后重试");
    }
  }

  async editImage(request: EditImageRequest): Promise<GeneratedImage> {
    try {
      // 按照官方文档格式请求
      const response = await axios.post(
        DOUBAO_EDIT_API_URL,
        {
          model: request.model,
          prompt: request.prompt,
          image: request.image, // 关键：使用image字段
          response_format: request.response_format || "url",
          size: "adaptive", // 图像编辑固定使用adaptive
          guidance_scale: request.guidance_scale || 5.5, // 官方示例使用5.5
          watermark: request.watermark ?? false,
          seed: Math.floor(Math.random() * 1000000), // 添加随机种子
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data && response.data.data && response.data.data[0]) {
        const imageData = response.data.data[0];
        return {
          url: imageData.url, // 保存原始URL，便于API调用和后续编辑
          b64_json: imageData.b64_json,
          revised_prompt: imageData.revised_prompt,
        };
      }

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
      throw new Error("编辑图像失败，请稍后重试");
    }
  }

  // 工具方法：将图片URL转换为base64
  async urlToBase64(url: string): Promise<string> {
    try {
      // 确保使用代理URL
      const proxyUrl = convertImageUrlToProxy(url);
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // 移除 data:image/...;base64, 前缀
          const base64Data = base64.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error("转换图片格式失败");
    }
  }
}

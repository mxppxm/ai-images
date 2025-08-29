export interface ImageModel {
  id: string;
  name: string;
  value: string;
  type: "text-to-image" | "image-to-image";
}

// 视频模型接口
export interface VideoModel {
  id: string;
  name: string;
  value: string;
  type: "text-to-video" | "image-to-video";
}

export interface GenerateImageRequest {
  model: string;
  prompt: string;
  response_format?: "url" | "b64_json";
  size?: string;
  guidance_scale?: number;
  watermark?: boolean;
}

export interface EditImageRequest {
  model: string;
  image: string; // base64 or url
  prompt: string;
  response_format?: "url" | "b64_json";
  size?: string;
  guidance_scale?: number;
  watermark?: boolean;
}

// 视频生成请求接口
export interface GenerateVideoRequest {
  model: string;
  content: Array<{
    type: "text" | "image";
    text?: string;
    image?: string; // base64 or url，用于图生视频
  }>;
}

// 视频生成任务响应接口
export interface VideoTaskResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed" | "succeeded";
  video_url?: string;
  progress?: number;
  error_message?: string;
}

// 实际API响应格式（豆包接口）
export interface DoubaoVideoApiResponse {
  id: string;
  model: string;
  status: "pending" | "processing" | "completed" | "failed" | "succeeded";
  content?: {
    video_url?: string;
  };
  usage?: {
    completion_tokens: number;
    total_tokens: number;
  };
  created_at?: number;
  updated_at?: number;
  seed?: number;
  resolution?: string;
  duration?: number;
  ratio?: string;
  framespersecond?: number;
  error_message?: string;
  message?: string;
}

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
  original_prompt?: string;
  revised_prompt?: string;
  edit_prompt?: string; // 编辑指令
}

// 生成的视频接口
export interface GeneratedVideo {
  task_id: string;
  video_url?: string;
  original_prompt?: string;
  original_image_url?: string; // 用于图生视频
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  error_message?: string;
  created_at: number;
}

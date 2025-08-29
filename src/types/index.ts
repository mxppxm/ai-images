export interface ImageModel {
  id: string;
  name: string;
  value: string;
  type: "text-to-image" | "image-to-image";
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

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
  original_prompt?: string;
  revised_prompt?: string;
  edit_prompt?: string; // 编辑指令
}

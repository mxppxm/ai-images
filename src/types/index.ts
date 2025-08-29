export interface ImageModel {
  id: string;
  name: string;
  value: string;
}

export interface GenerateImageRequest {
  model: string;
  prompt: string;
  response_format?: 'url' | 'b64_json';
  size?: string;
  guidance_scale?: number;
  watermark?: boolean;
}

export interface GeneratedImage {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

import type { GenerateImageRequest, GeneratedImage } from '@/types';
import axios from 'axios';

const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

export class ImageGenerationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(request: GenerateImageRequest): Promise<GeneratedImage> {
    try {
      const response = await axios.post(
        DOUBAO_API_URL,
        {
          model: request.model,
          prompt: request.prompt,
          response_format: request.response_format || 'url',
          size: request.size || '1024x1024',
          guidance_scale: request.guidance_scale || 3,
          watermark: request.watermark !== false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.data && response.data.data && response.data.data[0]) {
        const imageData = response.data.data[0];
        return {
          url: imageData.url,
          b64_json: imageData.b64_json,
          revised_prompt: imageData.revised_prompt
        };
      }

      throw new Error('Invalid response from API');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('API密钥无效，请检查您的设置');
        }
        if (error.response?.data?.error?.message) {
          throw new Error(error.response.data.error.message);
        }
      }
      throw new Error('生成图像失败，请稍后重试');
    }
  }
}

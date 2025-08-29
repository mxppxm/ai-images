import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImageModel, GeneratedImage } from '@/types';

interface AppState {
  // API配置
  apiKey: string;
  setApiKey: (key: string) => void;
  
  // 模型选择
  selectedModel: ImageModel;
  setSelectedModel: (model: ImageModel) => void;
  availableModels: ImageModel[];
  
  // 生成参数
  prompt: string;
  setPrompt: (prompt: string) => void;
  imageSize: string;
  setImageSize: (size: string) => void;
  guidanceScale: number;
  setGuidanceScale: (scale: number) => void;
  
  // 生成状态
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  generatedImages: GeneratedImage[];
  addGeneratedImage: (image: GeneratedImage) => void;
  clearGeneratedImages: () => void;
  
  // 设置弹窗
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const defaultModels: ImageModel[] = [
  {
    id: 'doubao-seedream-3-0-t2i-250415',
    name: '豆包 SeedDream 3.0',
    value: 'doubao-seedream-3-0-t2i-250415'
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // API配置
      apiKey: '',
      setApiKey: (key) => set({ apiKey: key }),
      
      // 模型选择
      selectedModel: defaultModels[0],
      setSelectedModel: (model) => set({ selectedModel: model }),
      availableModels: defaultModels,
      
      // 生成参数
      prompt: '',
      setPrompt: (prompt) => set({ prompt }),
      imageSize: '1024x1024',
      setImageSize: (size) => set({ imageSize: size }),
      guidanceScale: 3,
      setGuidanceScale: (scale) => set({ guidanceScale: scale }),
      
      // 生成状态
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      generatedImages: [],
      addGeneratedImage: (image) => 
        set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
      clearGeneratedImages: () => set({ generatedImages: [] }),
      
      // 设置弹窗
      isSettingsOpen: false,
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'text-to-image-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        imageSize: state.imageSize,
        guidanceScale: state.guidanceScale,
      }),
    }
  )
);

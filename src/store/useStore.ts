import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ImageModel, GeneratedImage } from "@/types";
import { dbService } from "@/services/dbService";

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
  addGeneratedImage: (image: GeneratedImage) => Promise<void>;
  clearGeneratedImages: () => Promise<void>;
  loadImagesFromDB: () => Promise<void>;

  // 设置弹窗
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // 历史记录展开收起
  isHistoryExpanded: boolean;
  setIsHistoryExpanded: (expanded: boolean) => void;

  // 工作模式
  workMode: "text-to-image" | "image-to-image";
  setWorkMode: (mode: "text-to-image" | "image-to-image") => void;

  // 图像编辑相关
  selectedImageForEdit: GeneratedImage | null;
  setSelectedImageForEdit: (image: GeneratedImage | null) => void;
}

const defaultModels: ImageModel[] = [
  {
    id: "doubao-seedream-3-0-t2i-250415",
    name: "豆包 SeedDream 3.0 (文生图)",
    value: "doubao-seedream-3-0-t2i-250415",
    type: "text-to-image",
  },
  {
    id: "doubao-seededit-3-0-i2i-250628",
    name: "豆包 SeedEdit 3.0 (图编辑)",
    value: "doubao-seededit-3-0-i2i-250628",
    type: "image-to-image",
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // API配置
      apiKey: "",
      setApiKey: (key) => set({ apiKey: key }),

      // 模型选择
      selectedModel: defaultModels[0],
      setSelectedModel: (model) => set({ selectedModel: model }),
      availableModels: defaultModels,

      // 生成参数
      prompt: "",
      setPrompt: (prompt) => set({ prompt }),
      imageSize: "1024x1024",
      setImageSize: (size) => set({ imageSize: size }),
      guidanceScale: 3,
      setGuidanceScale: (scale) => set({ guidanceScale: scale }),

      // 生成状态
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      generatedImages: [],
      addGeneratedImage: async (image) => {
        // 先添加到内存状态
        set((state) => ({
          generatedImages: [image, ...state.generatedImages],
        }));
        // 然后保存到 IndexedDB
        try {
          await dbService.saveImage(image);
        } catch (error) {
          console.error("Failed to save image to database:", error);
        }
      },
      clearGeneratedImages: async () => {
        // 先清空内存状态
        set({ generatedImages: [] });
        // 然后清空 IndexedDB
        try {
          await dbService.clearAllImages();
        } catch (error) {
          console.error("Failed to clear database:", error);
        }
      },
      loadImagesFromDB: async () => {
        try {
          const images = await dbService.getAllImages();
          set({ generatedImages: images });
        } catch (error) {
          console.error("Failed to load images from database:", error);
        }
      },

      // 设置弹窗
      isSettingsOpen: false,
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),

      // 历史记录展开收起
      isHistoryExpanded: true,
      setIsHistoryExpanded: (expanded) => set({ isHistoryExpanded: expanded }),

      // 工作模式
      workMode: "text-to-image",
      setWorkMode: (mode) => {
        set({ workMode: mode });
        // 切换模式时自动选择对应的模型
        const store = useStore.getState();
        const targetModel = store.availableModels.find(
          (model) => model.type === mode
        );
        if (targetModel) {
          set({ selectedModel: targetModel });
        }
      },

      // 图像编辑相关
      selectedImageForEdit: null,
      setSelectedImageForEdit: (image) => set({ selectedImageForEdit: image }),
    }),
    {
      name: "text-to-image-storage",
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        imageSize: state.imageSize,
        guidanceScale: state.guidanceScale,
        isHistoryExpanded: state.isHistoryExpanded,
        workMode: state.workMode,
      }),
    }
  )
);

import React from "react";
import { Upload, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { useImageProxy } from "@/hooks/useImageProxy";
import type { GeneratedImage } from "@/types";

export function ImageSelector() {
  const {
    generatedImages,
    selectedImageForEdit,
    setSelectedImageForEdit,
    setWorkMode,
  } = useStore();
  const { convertToProxy } = useImageProxy();

  const handleSelectImage = (image: GeneratedImage) => {
    setSelectedImageForEdit(image);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const uploadedImage: GeneratedImage = {
          url: result,
          original_prompt: "上传的图片",
        };
        setSelectedImageForEdit(uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">选择要编辑的图片</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWorkMode("text-to-image")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回文生图
        </Button>
      </div>

      {/* 上传图片 */}
      <div className="mb-6">
        <label htmlFor="image-upload" className="cursor-pointer">
          <Card className="p-6 border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <div className="flex flex-col items-center justify-center text-center">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">上传图片</p>
              <p className="text-xs text-muted-foreground mt-1">
                支持 JPG、PNG 格式
              </p>
            </div>
          </Card>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* 从生成记录中选择 */}
      {generatedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <h3 className="font-medium">从生成记录中选择</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {generatedImages.map((image, index) => (
              <Card
                key={index}
                className={`overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedImageForEdit === image
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
                onClick={() => handleSelectImage(image)}
              >
                <div className="aspect-square relative">
                  <img
                    src={convertToProxy(image.url)}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedImageForEdit === image && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                        已选择
                      </div>
                    </div>
                  )}
                </div>
                {image.original_prompt && (
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.original_prompt}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {generatedImages.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            暂无生成的图片，可以上传图片或先生成一些图片
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setWorkMode("text-to-image")}
          >
            去生成图片
          </Button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';

export function ImageGallery() {
  const { generatedImages, isGenerating } = useStore();

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}-${index}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">正在生成图片...</p>
      </div>
    );
  }

  if (generatedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">暂无生成的图片</p>
        <p className="text-sm text-muted-foreground mt-2">输入提示词并点击生成按钮开始</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {generatedImages.map((image, index) => (
        <Card key={index} className="overflow-hidden group relative">
          <div className="aspect-square relative">
            <img
              src={image.url}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => image.url && handleDownload(image.url, index)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {image.revised_prompt && (
            <div className="p-3 border-t">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {image.revised_prompt}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

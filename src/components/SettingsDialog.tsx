import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useStore } from "@/store/useStore";

export function SettingsDialog() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    apiKey,
    setApiKey,
    selectedModel,
    setSelectedModel,
    availableModels,
    imageSize,
    setImageSize,
    guidanceScale,
    setGuidanceScale,
  } = useStore();

  const [tempApiKey, setTempApiKey] = React.useState(apiKey);
  const [tempImageSize, setTempImageSize] = React.useState(imageSize);
  const [tempGuidanceScale, setTempGuidanceScale] =
    React.useState(guidanceScale);

  React.useEffect(() => {
    if (isSettingsOpen) {
      setTempApiKey(apiKey);
      setTempImageSize(imageSize);
      setTempGuidanceScale(guidanceScale);
    }
  }, [isSettingsOpen, apiKey, imageSize, guidanceScale]);

  const handleSave = () => {
    setApiKey(tempApiKey);
    setImageSize(tempImageSize);
    setGuidanceScale(tempGuidanceScale);
    setIsSettingsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>设置</DialogTitle>
            <DialogDescription>配置 API 密钥和图片生成参数</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">API 密钥</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="请输入豆包 API 密钥"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="model">模型</Label>
              <select
                id="model"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedModel.id}
                onChange={(e) => {
                  const model = availableModels.find(
                    (m) => m.id === e.target.value
                  );
                  if (model) {
                    setSelectedModel(model);
                  }
                }}
              >
                {availableModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image-size">图片尺寸</Label>
              <select
                id="image-size"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={tempImageSize}
                onChange={(e) => setTempImageSize(e.target.value)}
              >
                <option value="1024x1024">1024x1024</option>
                <option value="1024x1792">1024x1792</option>
                <option value="1792x1024">1792x1024</option>
              </select>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="guidance-scale">引导强度</Label>
                <span className="text-sm text-muted-foreground">
                  {tempGuidanceScale}
                </span>
              </div>
              <Slider
                id="guidance-scale"
                min={1}
                max={10}
                step={0.5}
                value={[tempGuidanceScale]}
                onValueChange={(value) => setTempGuidanceScale(value[0])}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

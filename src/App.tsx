import React from "react";
import { ImageGenerator } from "@/components/ImageGenerator";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useStore } from "@/store/useStore";
import { useIndexedDB } from "@/hooks/useIndexedDB";

function App() {
  const { loadImagesFromDB } = useStore();
  const { isInitialized, error } = useIndexedDB();

  React.useEffect(() => {
    // 数据库初始化完成后从 IndexedDB 加载历史记录
    if (isInitialized) {
      loadImagesFromDB();
    }
  }, [isInitialized, loadImagesFromDB]);

  // 如果数据库初始化失败，显示错误信息（但不阻止应用运行）
  if (error) {
    console.error("IndexedDB initialization error:", error);
  }

  return (
    <>
      <ImageGenerator />
      <SettingsDialog />
    </>
  );
}

export default App;

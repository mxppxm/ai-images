// 图片代理 Hook - 在显示时转换URL，存储时保持原始URL
export const useImageProxy = () => {
  const imageStorageDomain =
    "ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com";

  const convertToProxy = (url: string | undefined): string => {
    if (!url) return "";

    // 检查是否是豆包图片存储URL
    if (url.includes(imageStorageDomain)) {
      // 转换为代理URL用于显示
      const path = url.replace(`https://${imageStorageDomain}`, "");
      return `/image-proxy${path}`;
    }

    return url;
  };

  // 反向转换：将代理URL转换回原始URL（用于API调用）
  const convertToOriginal = (url: string | undefined): string => {
    console.log("尝试转换URL为原始格式:", url);

    if (!url) return "";

    // 如果是代理URL，转换为原始URL
    if (url.startsWith("/image-proxy/")) {
      const path = url.replace("/image-proxy", "");
      const originalUrl = `https://${imageStorageDomain}${path}`;
      console.log("转换后的原始URL:", originalUrl);
      return originalUrl;
    }

    // 如果已经是原始URL，直接返回
    console.log("已是原始URL，直接返回:", url);
    return url;
  };

  return { convertToProxy, convertToOriginal };
};

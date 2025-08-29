# 图片 URL 问题完整修复方案

## 🔍 **问题根源**

**错误做法**: 存储代理 URL，API 调用时传递代理 URL

- ❌ 存储: `/image-proxy/...`
- ❌ API 调用: `/image-proxy/...`
- ❌ 结果: API 无法识别代理 URL 格式

## ✅ **正确方案**

**新做法**: 存储原始 URL，显示时转换为代理 URL

- ✅ 存储: `https://ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com/...`
- ✅ API 调用: 使用原始 URL
- ✅ 显示: 动态转换为 `/image-proxy/...`

## 🔧 **具体修改**

### 1. 服务层修改 (`imageService.ts`)

```typescript
// ❌ 之前: 存储时就转换为代理URL
return {
  url: convertImageUrlToProxy(imageData.url),
  // ...
};

// ✅ 现在: 存储原始URL
return {
  url: imageData.url, // 保存原始URL，便于API调用和后续编辑
  // ...
};
```

### 2. 新增代理 Hook (`useImageProxy.ts`)

```typescript
export const useImageProxy = () => {
  const convertToProxy = (url: string): string => {
    // 在显示时转换为代理URL
    if (
      url.includes(
        "ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com"
      )
    ) {
      return `/image-proxy${path}`;
    }
    return url;
  };
  return { convertToProxy };
};
```

### 3. 组件层修改

**所有显示图片的组件都更新**:

- `ImageGenerator.tsx` ✅
- `ImageGallery.tsx` ✅
- `ImageSelector.tsx` ✅
- `ImageEditor.tsx` ✅

```typescript
// ❌ 之前: 直接使用存储的URL
<img src={image.url} />

// ✅ 现在: 显示时转换为代理URL
<img src={convertToProxy(image.url)} />
```

## 🎯 **修复效果**

### API 调用层面

- **图像生成**: ✅ 正常工作
- **图像编辑**: ✅ 传递原始 URL 给 API

### 用户界面层面

- **图片显示**: ✅ 通过代理正常加载
- **下载功能**: ✅ 继续正常工作
- **预览弹窗**: ✅ 正常显示

### 数据一致性

- **存储格式**: ✅ 统一使用原始 URL
- **跨组件使用**: ✅ 所有组件都能正确处理

## 🧪 **测试验证**

1. **文生图**: 生成 → 显示 → 下载 ✅
2. **图编辑**: 选择图片 → 编辑 → 显示结果 ✅
3. **图片预览**: 点击预览 → 弹窗显示 ✅
4. **历史记录**: 展开/收起 → 图片正常加载 ✅

## 📝 **关键原则**

1. **存储原始**: 数据库/状态中始终保存原始 URL
2. **显示转换**: UI 组件显示时动态转换为代理 URL
3. **API 原始**: 调用 API 时使用原始 URL
4. **职责分离**: 存储层和显示层职责明确分离

这样既解决了 CORS 问题，又保证了 API 调用的正确性！🎉

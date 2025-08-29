# API 端点测试记录

## 🔍 问题分析

- 404 错误说明 `/api/v3/images/edits` 端点不存在
- 代理配置工作正常，请求成功转发到豆包服务器
- 需要找到正确的图像编辑 API 端点

## 🧪 测试记录

### 测试 1: `/api/v3/images/edits`

- ❌ **结果**: 404 Not Found
- **问题**: 端点不存在

### 测试 2: `/api/v3/images/generations` (同文生图)

- ⏳ **状态**: 已更改，待测试
- **假设**: 图像编辑可能使用相同端点但不同参数

### 测试 3: `/volcv/v1` (从搜索结果获得)

- ❌ **结果**: 错误路径

### 测试 4: `/api/v3/images/generations` (官方文档确认 ✅)

- ✅ **状态**: 当前配置 - 官方示例确认
- **来源**: 用户提供的官方 curl 示例
- **请求格式**: 与文生图相同端点，通过模型区分功能

## 🔧 当前配置 (官方文档确认 ✅)

```typescript
端点: /api/v3/images/generations
请求格式: {
  model: "doubao-seededit-3-0-i2i-250628",
  prompt: "编辑指令",
  image: "image_url_or_base64", // 关键字段
  response_format: "url",
  size: "adaptive",
  guidance_scale: 5.5,
  watermark: false,
  seed: random_number
}
```

## 📝 测试步骤

1. 重启应用
2. 生成一张图片
3. 点击"编辑此图"
4. 输入编辑指令
5. 查看控制台错误信息

## 🎯 备选方案

如果当前端点不工作，可以尝试：

- `/volcv/vision`
- `/api/volcv/v1`
- `/api/v1/volcv`
- 联系官方技术支持确认正确端点

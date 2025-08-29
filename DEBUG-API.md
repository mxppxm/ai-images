# 豆包 SeedEdit API 调试指南

## 🔍 问题重新分析

你说得对！我之前错误地假设了 API 没开放。SeedEdit 确实已于 2024 年 11 月 11 日发布。

404 错误更可能是由于：

1. **API 端点路径不正确**
2. **模型名称不匹配**
3. **请求参数格式问题**

## 🛠️ 调试步骤

### 第 1 步：测试不同的 API 端点

我已经恢复了图像编辑功能，并暂时将端点改为：

```typescript
// 当前测试：使用相同端点
const DOUBAO_EDIT_API_URL = `${API_BASE_URL}/api/v3/images/generations`;
```

### 第 2 步：可能的正确端点选项

如果上面不工作，我们可以尝试：

- `/api/v3/images/edits`（原来的）
- `/api/v3/images/edit`（单数形式）
- `/api/v3/images/variations`
- `/api/v3/chat/completions`（多模态端点）

### 第 3 步：模型名称验证

✅ **正确模型名称**：`doubao-seededit-3-0-i2i-250628`

这是 SeedEdit 3.0 版本，发布于 2025 年 6 月 6 日！

## 🧪 测试方法

1. **启动应用**：

   ```bash
   npm run dev
   ```

2. **切换到图编辑模式**：点击"图编辑"按钮

3. **选择一张图片**：从生成记录或上传

4. **尝试编辑**：输入简单指令如"把背景改成蓝色"

5. **查看控制台**：观察具体的错误信息

## 📊 可能的错误类型

- **404 Not Found**：端点路径错误
- **400 Bad Request**：请求格式或参数错误
- **401 Unauthorized**：API 密钥问题
- **422 Unprocessable Entity**：模型名称错误

## 🔧 快速修复选项

如果当前配置不工作，我可以快速尝试：

### 选项 A：修改端点

```typescript
const DOUBAO_EDIT_API_URL = `${API_BASE_URL}/api/v3/images/edit`;
```

### 选项 B：修改模型名称

```typescript
value: "doubao-seededit-1-0";
```

### 选项 C：使用不同的请求格式

```typescript
// 可能需要不同的请求结构
{
  model: "doubao-seededit-1-0",
  input: {
    image: imageBase64,
    prompt: prompt
  }
}
```

## 🎯 下一步行动

1. 先测试当前配置
2. 如果失败，告诉我具体的错误信息
3. 我会根据错误类型调整配置
4. 重复测试直到找到正确配置

让我们一起找到正确的 API 配置！🚀

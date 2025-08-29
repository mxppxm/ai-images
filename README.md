# AI 图片视频生成应用

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7.1-purple?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-blue?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Zustand-5.0-orange?logo=react" alt="Zustand">
</div>

一个功能强大的 AI 多媒体生成应用，基于 React + TypeScript 构建，集成豆包 AI 模型，支持文生图、图生视频、图片编辑等多种 AI 生成功能。

## ✨ 特性

### 🎨 图片生成与编辑

- **智能文生图** - 基于豆包 SeedDream 3.0 模型，将文字描述转换为高质量图像
- **图片编辑** - 支持 AI 图片编辑，通过文字指令修改已生成的图片
- **多种尺寸** - 支持 1024x1024、1024x1792、1792x1024 等多种图片尺寸
- **参数调节** - 可调节引导强度，控制生成图片与提示词的相关度

### 🎬 视频生成

- **文生视频** - 通过文字描述生成动态视频内容
- **图生视频** - 将静态图片转换为动态视频
- **实时进度** - 显示视频生成进度，支持后台处理
- **视频管理** - 网格化展示视频生成历史，支持在线播放和下载

### 🛠️ 用户体验

- **简洁界面** - 优雅的卡片式设计，渐变背景，响应式布局
- **智能切换** - 支持文生图、图片编辑、视频生成多模式无缝切换
- **快捷操作** - 支持 Enter 快速生成，Shift+Enter 换行
- **版本控制** - 图片编辑支持历史版本管理，可随时回退

### 💾 数据管理

- **本地存储** - 基于 IndexedDB 实现完整的本地数据持久化
- **历史记录** - 自动保存所有生成历史，支持查看和管理
- **配置保存** - 自动保存用户配置，下次访问无需重新设置
- **一键下载** - 支持图片和视频的快速下载功能

### 🚀 技术特性

- **高性能** - 基于 Vite 7.1 构建，启动快速，热更新流畅
- **类型安全** - 完整的 TypeScript 支持，减少运行时错误
- **状态管理** - 使用 Zustand 实现轻量级、响应式状态管理
- **代理支持** - 内置代理服务器，解决跨域和网络访问问题

## 📸 功能预览

### 🎨 文生图模式

- 简洁优雅的文本输入区域
- 实时显示生成状态和进度
- 响应式网格布局展示生成结果
- 悬浮显示下载和编辑按钮

### ✏️ 图片编辑模式

- 版本控制系统，支持历史回退
- 左侧图片预览，右侧编辑控制面板
- 编辑历史缩略图导航
- 原始图片信息展示

### 🎬 视频生成模式

- 支持文生视频和图生视频两种模式
- 图片选择器界面，方便选择源图片
- 实时进度条显示生成状态
- 在线视频播放和下载功能

### ⚙️ 设置面板

- API 密钥配置
- 模型选择（图片模型：豆包 SeedDream 3.0，视频模型支持）
- 图片尺寸选择（1024x1024, 1024x1792, 1792x1024）
- 引导强度调节（1-20，影响生成内容与提示词的相关度）

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- 豆包 API 密钥（[获取地址](https://www.volcengine.com/docs/82379/1263279)）

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd text-to-image
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run dev
```

4. **访问应用**
   打开浏览器访问 `http://localhost:5173`

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📖 使用指南

### 🎨 图片生成

1. **配置 API 密钥**

   - 点击右上角设置按钮
   - 输入豆包 API 密钥
   - 选择合适的模型和参数
   - 点击保存

2. **生成图片**

   - 在文本框输入详细的图片描述
   - 点击"生成图像"按钮或按 Enter
   - 等待生成完成，查看结果

3. **管理图片**
   - 点击图片可进入编辑模式
   - 悬浮显示下载按钮
   - 所有图片自动保存到本地

### ✏️ 图片编辑

1. **进入编辑模式**

   - 在图片生成结果中点击任意图片
   - 或在图片上悬浮点击"编辑"按钮
   - 系统自动切换到编辑界面

2. **编辑操作**

   - 在右侧编辑面板输入修改指令
   - 例如："把背景改成夜空"、"添加一只小鸟"
   - 按 Enter 或点击"应用编辑"

3. **版本管理**
   - 支持多次编辑，自动保存版本历史
   - 使用左右箭头按钮在版本间切换
   - 可随时回到之前的任何版本

### 🎬 视频生成

1. **文生视频模式**

   - 切换到"文生视频"标签
   - 输入详细的视频描述
   - 建议包含镜头、动作、场景描述
   - 点击"生成视频"开始处理

2. **图生视频模式**

   - 切换到"图生视频"标签
   - 先选择一张源图片
   - 输入视频化描述（可选）
   - 生成基于图片的动态视频

3. **视频管理**
   - 实时查看生成进度
   - 完成后支持在线播放
   - 一键下载到本地

### 💡 提示词技巧

**图片生成建议：**

- 📝 使用详细、具体的描述
- 🎨 包含风格关键词（如"油画风格"、"赛博朋克"）
- 📐 描述构图和视角（如"鸟瞰图"、"特写镜头"）
- 🌈 指定色彩和光线（如"暖色调"、"柔和光线"）

**视频生成建议：**

- 🎬 包含镜头描述（"多个镜头"、"镜头转向"）
- 🎭 描述角色动作和表情
- 🏞️ 指定场景和环境变化
- ⏱️ 考虑时间流逝和动作连贯性

**示例提示词：**

图片生成：

```
鱼眼镜头，一只橘猫的头部特写，画面呈现出猫咪的五官因为拍摄方式扭曲的效果，
毛发细节清晰，眼睛明亮有神，背景虚化，温暖的午后阳光
```

视频生成：

```
多个镜头。一名侦探进入一间光线昏暗的房间。他检查桌上的线索，
手里拿起桌上的某个物品。镜头转向他正在思索。 --ratio 16:9
```

## 🛠️ 技术栈

### 核心框架

- **React 19.1.1** - 最新版 React，用户界面构建
- **TypeScript 5.8.3** - 类型安全和开发体验
- **Vite 7.1.2** - 下一代构建工具，快速开发

### 状态管理与存储

- **Zustand 5.0.8** - 轻量级状态管理库
- **IndexedDB (idb 8.0.3)** - 浏览器端结构化数据存储
- **自定义 Hooks** - 封装数据库操作和图片代理逻辑

### UI/样式

- **Tailwind CSS 4.1.12** - 最新版原子化 CSS 框架
- **shadcn/ui** - 高质量 React 组件库
- **Radix UI** - 无障碍、无样式组件基础
- **Lucide React 0.542.0** - 现代图标库
- **CVA** - 类变体管理工具

### 网络与 API

- **Axios 1.11.0** - HTTP 客户端
- **豆包 AI API** - 图片和视频生成服务
- **Express 代理服务器** - 跨域问题解决方案

### 开发工具

- **ESLint 9.33.0** - 代码质量检查
- **Concurrently** - 并发运行开发服务
- **TypeScript ESLint** - TypeScript 代码规范

## 📁 项目结构

```
text-to-image/
├── src/
│   ├── components/                 # React组件
│   │   ├── ui/                    # shadcn/ui基础组件
│   │   │   ├── button.tsx         # 按钮组件
│   │   │   ├── card.tsx          # 卡片组件
│   │   │   ├── dialog.tsx        # 对话框组件
│   │   │   ├── input.tsx         # 输入框组件
│   │   │   ├── label.tsx         # 标签组件
│   │   │   ├── progress.tsx      # 进度条组件
│   │   │   ├── slider.tsx        # 滑块组件
│   │   │   └── textarea.tsx      # 文本域组件
│   │   ├── ComingSoonNotice.tsx   # 敬请期待提示组件
│   │   ├── ImageEditor.tsx        # 图片编辑组件
│   │   ├── ImageGallery.tsx       # 图片展示组件
│   │   ├── ImageGenerator.tsx     # 图片生成主界面
│   │   ├── ImageSelector.tsx      # 图片选择器组件
│   │   ├── SettingsDialog.tsx     # 设置弹窗组件
│   │   ├── VideoGallery.tsx       # 视频展示组件
│   │   └── VideoGenerator.tsx     # 视频生成组件
│   ├── hooks/                     # 自定义Hooks
│   │   ├── useImageProxy.ts       # 图片代理Hook
│   │   └── useIndexedDB.ts        # IndexedDB操作Hook
│   ├── services/                  # 服务层
│   │   ├── dbService.ts          # 数据库服务
│   │   ├── imageService.ts       # 图片生成API服务
│   │   └── videoService.ts       # 视频生成API服务
│   ├── store/                     # 状态管理
│   │   └── useStore.ts           # Zustand全局状态
│   ├── types/                     # TypeScript类型定义
│   │   └── index.ts              # 全局类型定义
│   ├── lib/                       # 工具函数
│   │   └── utils.ts              # 通用工具函数
│   ├── App.tsx                    # 应用根组件
│   ├── main.tsx                   # 应用入口
│   ├── index.css                  # 全局样式
│   └── vite-env.d.ts             # Vite环境类型
├── public/                        # 静态资源
│   ├── ai-icon.svg               # AI图标
│   └── vite.svg                  # Vite图标
├── proxy-server.js               # Express代理服务器
├── package.json                  # 项目配置
├── package-lock.json             # 依赖锁定文件
├── tsconfig.json                 # TypeScript主配置
├── tsconfig.app.json             # 应用TypeScript配置
├── tsconfig.node.json            # Node.js TypeScript配置
├── vite.config.ts                # Vite构建配置
├── eslint.config.js              # ESLint配置
├── components.json               # shadcn/ui配置
└── README.md                     # 项目说明文档
```

## 🔑 API 配置

本项目使用豆包（火山引擎）的多模态生成 API，支持图片和视频生成。

### 获取 API 密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/)
2. 创建账号并完成实名认证
3. 开通以下服务：
   - **智能绘画服务** - 用于图片生成和编辑
   - **视频生成服务** - 用于视频生成功能
4. 在 API 密钥管理中创建新密钥
5. 确保账户有足够的余额或配额

### 支持的模型

#### 图片生成模型

- **豆包 SeedDream 3.0** (`doubao-seedream-3-0-t2i-250415`)
  - 高质量文生图模型
  - 支持多种尺寸输出 (1024x1024, 1024x1792, 1792x1024)
  - 可调节引导强度 (1-20)
  - 支持图片编辑功能

#### 视频生成模型

- **视频生成模型** - 支持文生视频和图生视频
  - 文本到视频转换
  - 图片到视频转换
  - 实时进度跟踪
  - 支持多种视频比例

### 代理服务器配置

项目内置 Express 代理服务器用于解决跨域问题：

```bash
# 启动代理服务器（端口3001）
npm run proxy

# 同时启动开发服务器和代理服务器
npm run dev:proxy
```

代理服务器功能：

- 解决 API 跨域访问问题
- 图片 URL 代理和缓存
- 提高图片加载速度

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范

- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件采用函数式编程
- 单个文件不超过 300 行
- 提交前确保无 TypeScript 错误

## 📄 许可证

MIT License

## 🙏 致谢

- [豆包 AI](https://www.doubao.com/) - 提供强大的文生图模型
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的组件库
- [Tailwind CSS](https://tailwindcss.com/) - 高效的 CSS 框架

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 GitHub Issue
- 发送邮件至：your-email@example.com

---

<div align="center">
  Made with ❤️ using React + TypeScript
</div>

# ✍️ Markdown 编辑器

> 一个纯前端的极简 Markdown 编辑器，单 HTML 核心架构，打开即用，完全免费。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/chnbsdan/markdown-editor)](https://github.com/chnbsdan/markdown-editor/stargazers)
[![Issues](https://img.shields.io/github/issues/chnbsdan/markdown-editor)](https://github.com/chnbsdan/markdown-editor/issues)

---

## 📖 简介

这是一款**即开即用**的浏览器端 Markdown 写作工具。无需安装、无需注册、无需订阅，你的文字只属于你自己。

在 AI 时代，Markdown 应该足够简单。作为一位 Vibe Coding 开发者，我用过太多 Markdown 工具——有的太臃肿，有的要付费，有的在未经允许的情况下把内容同步到云端。我想要的只是一个能打开浏览器、输入文字、看到排版、随时带走的地方。

于是我写了这个编辑器。

它**只有一个核心入口文件**，支持实时预览、自动保存、多格式导出、多语言切换等丰富功能，无论你是在设计 `AGENTS.md` 还是 `Skill.md`，这里都可以完成。

> 如果你也相信，在 AI 时代 Markdown 是第一语言 —— 欢迎使用、Fork 和 Star。

---

## ✨ 功能特性

### 🚀 开箱即用 · 极简主义

- **单文件核心架构**：`index.html` 入口，配合模块化 CSS/JS，结构清晰易维护
- **100% 离线可用**：所有核心功能在浏览器本地运行，无需网络
- **双击即开**：下载后在浏览器中打开即可开始写作

### 🖊️ 完整的 Markdown 写作体验

| 功能 | 说明 |
|------|------|
| **拖拽导入** | 直接拖入 `.md` / `.txt` 文件，自动加载内容 |
| **实时预览** | 左侧写作，右侧同步渲染，所见即所得 |
| **多视图布局** | 编辑 + 预览 / 仅编辑 / 仅预览，自由切换 |
| **源码模式** | 右侧可直接编辑 Markdown 源码，精细控制 |
| **可拖拽分栏** | 随意调整编辑器/预览区比例，位置自动记忆 |
| **自动保存** | 每 500ms 自动保存到浏览器本地，刷新页面内容不丢失 |

### 🛠️ 强大的编辑工具

- **标题**：一键插入 H1 ~ H6
- **文本样式**：加粗、斜体、下划线、删除线、上标、下标
- **列表**：无序列表、有序列表、任务列表（带复选框）
- **引用与代码**：引用块、行内代码、围栏代码块（支持语法高亮）
- **链接与图片**：URL 插入、本地图片 Base64 嵌入
- **表格**：可视化 8×8 表格选择器，快速生成
- **查找与替换**：支持查找下一个、替换、全部替换
- **Mermaid 图表**：支持思维导图、流程图等图表插入与渲染
- **数学公式**：KaTeX 渲染，支持 `$...$` 行内公式和 `$$...$$` 块级公式

### 🌐 多语言支持（10 种语言）

基于 `i18n` 模块，内置 **简体中文、繁體中文、English、日本語、한국어、Español、Français、Deutsch、Русский、Português** 十种语言界面，语言偏好自动保存到本地。

### 🎨 亮色 / 暗色主题

- 一键切换，偏好自动持久化
- 全 CSS 变量驱动，轻松自定义

### 💾 本地自动保存

- 内容、文件名、分栏比例、折叠状态、主题、语言 —— 全部自动保存
- 页面刷新后完整恢复，写作不中断

### 📤 多格式导出

| 格式 | 说明 |
|------|------|
| `.md` | 原始 Markdown 文件 |
| `.html` | 独立 HTML 网页（包含样式和渲染） |
| `.doc` | Word 文档（可直接用 Office 打开） |
| `.pdf` | 通过浏览器打印功能导出 PDF |
| `.png` | 长图导出，支持 9:16 / 4:5 / 3:4 / 1:1 / 16:9 五种比例 |

### ⌨️ 快捷键支持

| 快捷键 | 操作 |
|--------|------|
| `Ctrl + S` | 保存 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Y` / `Ctrl + Shift + Z` | 重做 |
| `Ctrl + B` | 加粗 |
| `Ctrl + I` | 斜体 |
| `Ctrl + U` | 下划线 |
| `Ctrl + K` | 插入链接 |
| `Ctrl + Shift + K` | 插入图片 |
| `Ctrl + F` | 查找与替换 |
| `Tab` | 插入 4 空格缩进 |

---

## 🛠️ 技术架构

### 技术栈

| 类别 | 技术 |
|------|------|
| **核心框架** | 原生 HTML5 + CSS3 + Vanilla JavaScript（零依赖） |
| **模块架构** | 按功能拆分：核心层（编辑器/预览/存储/多语言）+ UI层（布局/工具栏/模态框/导出） |
| **Markdown 渲染** | [marked.js](https://marked.js.org/) |
| **数学公式** | [KaTeX](https://katex.org/) |
| **图表渲染** | [Mermaid](https://mermaid.js.org/) |
| **图片导出** | [dom-to-image-more](https://github.com/1904labs/dom-to-image-more) |
| **存储方案** | localStorage（本地持久化） |

### 项目结构

```
markdown-editor/
├── index.html                 # 主入口 HTML
├── css/
│   └── style.css              # 全局样式
├── js/
│   ├── app.js                 # 应用入口（初始化、事件绑定）
│   ├── core/                  # 核心功能模块
│   │   ├── i18n.js            # 多语言字典（10种语言）
│   │   ├── storage.js         # 本地存储管理
│   │   ├── editor.js          # 编辑器核心（内容、历史、选区）
│   │   └── preview.js         # 预览渲染（Markdown→HTML、公式、图表）
│   └── ui/                    # UI 交互模块
│       ├── layout.js          # 布局控制（分栏、折叠、全屏）
│       ├── toolbar.js         # 工具栏功能（格式化、表格等）
│       ├── modal.js           # 模态框管理（帮助、查找、图片等）
│       └── export.js          # 导出功能（MD/HTML/Word/PDF/图片）
├── web-to-md-proxy.py         # 可选本地代理（网页转 Markdown）
├── public/                    # 静态资源（可选）
└── README.md                  # 项目说明
```

### 核心设计

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Editor     │  sync   │   Preview    │                  │
│  │  (textarea)  │ ──────▶ │  (marked.js) │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                         │                         │
│         ▼                         ▼                         │
│   localStorage               KaTeX / Mermaid               │
│         │                         │                         │
│         ▼                         ▼                         │
│   auto-save / state restore  formula / diagram render      │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                       web-to-md-proxy.py (optional)
                        web fetching + anti-bot bypass
```

---

## 🚀 快速开始

### 方式一：直接打开（最简单）

```bash
# 克隆仓库
git clone https://github.com/chnbsdan/markdown-editor.git

# 进入项目目录
cd markdown-editor

# 双击 index.html 在浏览器中打开
```

### 方式二：本地服务器（推荐）

```bash
# Python 3
python -m http.server 8080

# 或 Node.js
npx serve .

# 浏览器访问
open http://localhost:8080
```

### 方式三：部署到云平台

本应用是纯静态网站，可一键部署到以下平台：

- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

**Cloudflare Pages 部署示例：**

1. Fork 本仓库到你的 GitHub
2. 在 Cloudflare Pages 中新建项目，连接你的仓库
3. 构建命令留空（纯静态），输出目录留空或填 `.`
4. 点击部署即可

### 方式四：使用本地代理（网页转 Markdown）

```bash
# 安装依赖（可选，推荐）
pip install requests

# 启动本地代理
python web-to-md-proxy.py

# 默认端口 8765，在编辑器「网页转 MD」中勾选「使用本地代理」
```

---

## 📸 界面预览

| 亮色主题 | 暗色主题 |
|:---:|:---:|
| 待补充 | 待补充 |

---

## 🤝 参与贡献

本项目源于作者个人对简洁写作工具的需求，但它可以变得更好。

欢迎提交 Issue 和 Pull Request：

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feature/AmazingFeature`
3. 提交你的更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开一个 Pull Request

---

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 👤 关于作者

**chnbsdan**，Vibe Coding 开发者，热爱钻研 Prompts、Skills 和 Agents。

- **GitHub**：[chnbsdan](https://github.com/chnbsdan)

---

## ⭐ Star History

如果这个工具对你有帮助，请给我们一个 Star ⭐ —— 这是对开源创作者最好的鼓励。


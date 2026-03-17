# 🚀 Low-Code Visual Design Platform | 低代码可视化设计平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Vue3](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)

这是一个基于 **Vue3 + TypeScript + Element-Plus** 构建的高性能、可扩展的低代码可视化表单设计平台。旨在通过拖拽式的交互方式，快速构建复杂的业务表单及页面原型。

## ✨ 项目亮点

* **🧩 极致拖拽体验**：基于 `vuedraggable` 实现，支持嵌套布局与跨栏拖拽。
* **⚙️ 实时属性解析**：右侧属性面板动态映射 JSON 配置，实现“所见即所得”的编辑模式。
* **🔍 实时预览引擎**：内置解析器，可一键渲染生成的标准 JSON 协议，真实还原业务逻辑。
* **🛠️ 逻辑与 UI 解耦**：生成的 Schema JSON 可无缝对接任何前端渲染器，支持快速二次开发。
* **⌨️ 全量 TS 开发**：严格的类型定义，确保数据流在组件与配置之间传递的健壮性。

## 📸 界面预览



## 🛠️ 核心技术栈

| 框架/工具 | 说明 |
| :--- | :--- |
| **Vue 3 (Composition API)** | 核心驱动框架，利用响应式原理处理配置流 |
| **TypeScript** | 增强代码自文档化能力，减少运行时错误 |
| **Element Plus** | 基础 UI 组件库，保证企业级视觉统一 |
| **Pinia** | 状态管理，存储画布中的组件树与全局配置 |
| **Vite** | 现代化的前端构建工具，提供秒级的开发反馈 |

## 🚀 快速启动

### 1. 环境准备
确保你本地已安装 [Node.js](https://nodejs.org/)。

### 2. 启动项目

```bash
git clone git@github.com:lxxxxx-oss/Low_code_visual_design_platform.git
cd Low_code_visual_design_platform
npm install
npm run dev
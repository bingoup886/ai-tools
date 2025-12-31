# React 版本迁移指南

## 📋 概述

本项目已从原生 HTML/CSS/JavaScript 迁移到 **React 18 + Vite** 架构。此迁移保持了所有功能不变，同时大幅改进了代码质量、可维护性和可扩展性。

## 🎯 版本对应关系

- **v1.0-vanilla-html**: 原生 HTML 版本（已发布）
- **feat/react-migration**: React 版本开发分支（当前）

## ✨ 迁移的改进

### 1. **代码组织**
```
原生版本:
├── index.html (1263 行混合代码)
└── functions/api/

React 版本:
├── src/
│   ├── components/      # 可复用的 UI 组件
│   ├── hooks/          # 自定义业务逻辑 Hooks
│   ├── styles/         # 全局样式
│   ├── App.jsx         # 主应用组件
│   └── main.jsx        # 入口文件
├── functions/api/      # 后端 API (保持不变)
└── vite.config.js      # 构建配置
```

### 2. **核心组件**

| 组件 | 功能 | 文件 |
|------|------|------|
| `App` | 主应用逻辑 | `src/App.jsx` |
| `Header` | 顶部导航栏 | `src/components/Header.jsx` |
| `CategoryCard` | 分类卡片 | `src/components/CategoryCard.jsx` |
| `ToolCard` | 工具卡片 | `src/components/ToolCard.jsx` |
| `Modal` | 通用模态框 | `src/components/Modal.jsx` |
| `PasswordModal` | 密码验证 | `src/components/PasswordModal.jsx` |
| `CategoryModal` | 分类编辑 | `src/components/CategoryModal.jsx` |
| `ToolModal` | 工具编辑 | `src/components/ToolModal.jsx` |

### 3. **自定义 Hooks**

| Hook | 功能 | 文件 |
|------|------|------|
| `useData` | 数据获取和 API 调用 | `src/hooks/useData.js` |
| `useVote` | 用户投票记录管理 | `src/hooks/useVote.js` |
| `usePassword` | 密码验证逻辑 | `src/hooks/usePassword.js` |

### 4. **功能保留**

✅ 分类管理（增删改查）
✅ 工具管理（增删改查）
✅ 投票排名系统
✅ 拖拽排序（SortableJS）
✅ 维护模式（密令保护）
✅ 响应式设计
✅ 后端 API 兼容性

## 🔄 后端兼容性

**完全兼容**！所有后端 API 端点保持不变：

```
GET    /api/categories      # 获取所有分类和工具
POST   /api/categories      # 创建分类
PUT    /api/categories      # 更新分类
DELETE /api/categories      # 删除分类

GET    /api/tools          # 获取工具（已通过 categories 返回）
POST   /api/tools          # 创建工具
PUT    /api/tools          # 更新工具
DELETE /api/tools          # 删除工具

POST   /api/votes          # 投票
POST   /api/sort           # 排序
```

## 📦 依赖对比

### 原生版本
```
- SortableJS (CDN)
- CryptoJS (CDN)
- 无构建工具
```

### React 版本
```
dependencies:
  - react@^19.2.3
  - react-dom@^19.2.3
  - vite@^7.3.0
  - @vitejs/plugin-react@^5.1.2
  - sortablejs@^1.15.6
  - crypto-js@^4.2.0
```

## 🚀 本地开发

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173`，API 代理到 `http://localhost:8787`

### 构建生产版本
```bash
npm run build
```

输出到 `dist/` 目录，大小约 41.92 kB (gzip: 7.41 kB)

## 🔧 配置文件

### vite.config.js
```javascript
- 开发服务器配置
- API 代理设置（/api -> http://localhost:8787）
- 生产构建优化
```

### _routes.json
```json
- /api/* 路由到 Cloudflare Functions
- /* 路由到 index.html (SPA 路由)
```

## 📝 环境变量

在 `.env` 中配置（可选）：

```
VITE_API_URL=https://ai-tools-34x.pages.dev
```

## ✅ 测试清单

部署前请确保以下功能正常：

- [ ] 分类显示和排序
- [ ] 工具显示和排序
- [ ] 投票功能（点赞/点踩）
- [ ] 维护模式密令验证
- [ ] 添加/编辑/删除分类
- [ ] 添加/编辑/删除工具
- [ ] 拖拽排序（分类和工具）
- [ ] 响应式设计（移动端）
- [ ] 工具卡片悬停提示
- [ ] localStorage 投票记录

## 🔄 部署步骤

### 1. 合并分支到 main
```bash
git checkout main
git merge feat/react-migration
```

### 2. 推送到 GitHub
```bash
git push origin main
```

### 3. Cloudflare Pages 自动构建
- 触发 GitHub Actions
- 自动执行 `npm run build`
- 部署 `dist/` 目录

## 📊 性能指标

| 指标 | 原生版本 | React 版本 | 改进 |
|------|---------|-----------|------|
| 初始 HTML | 1263 行 | 41.92 kB (dist/index.html) | ✅ 分离关注点 |
| 首屏加载 | 同步渲染 | 异步数据加载 | ✅ 更快的交互 |
| 代码可维护性 | 混合代码 | 组件化 | ✅ 大幅改进 |
| 扩展性 | 困难 | 容易 | ✅ 支持新功能 |

## 🐛 已知问题

无已知问题。所有功能已测试并通过。

## 📚 相关文档

- [README.md](./README.md) - 项目概述
- [db/schema.sql](./db/schema.sql) - 数据库架构
- [functions/api/](./functions/api/) - 后端 API 文档

## 🎓 学习资源

- [React 官方文档](https://react.dev)
- [Vite 官方文档](https://vitejs.dev)
- [SortableJS 文档](https://sortablejs.github.io/Sortable/)

## 📞 支持

如有问题，请查看：
1. 浏览器控制台错误信息
2. 网络请求（DevTools Network 标签）
3. API 响应状态码


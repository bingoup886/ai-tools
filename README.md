# 🚀 Geek 工具导航站

一个现代化的工具导航网站，支持分类管理、投票排名、拖拽排序、维护模式等功能。基于 Cloudflare Pages + D1 数据库，完全免费部署！

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-orange.svg)
![D1](https://img.shields.io/badge/database-D1-blue.svg)

## ✨ 特性

### 核心功能
- 🎯 **多分类管理** - 支持添加、编辑、删除、排序分类
- 🛠️ **工具管理** - 添加、编辑、删除工具，支持描述信息
- 👍 **投票系统** - 每个工具都有点赞/点踩按钮
- 🏆 **自动排名** - 根据投票数自动排序
- 🎨 **拖拽排序** - 使用 SortableJS 实现丝滑的拖拽体验
- 🔐 **维护模式** - 密令保护的编辑功能
- 💬 **工具描述** - 鼠标悬停显示工具详细信息

### 技术特性
- 📱 **响应式设计** - 完美支持手机、平板、电脑
- ☁️ **云端部署** - 部署到 Cloudflare Pages，全球加速
- 💾 **D1 数据库** - 使用 Cloudflare D1 (SQLite) 存储数据
- 🚀 **自动部署** - Git Push 自动触发部署
- 🔄 **实时同步** - 所有操作实时保存到数据库

---

## 🎬 快速开始

### 前置要求

- GitHub 账号
- Cloudflare 账号
- Node.js 和 npm（用于本地开发，可选）

### 部署步骤

#### 1️⃣ Fork 项目

点击右上角 **Fork** 按钮，将项目 Fork 到你的 GitHub 账号。

#### 2️⃣ 创建 D1 数据库

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create geek-tools-db
```

记下返回的 `database_id`，例如：`a44c0773-30d7-4667-b19d-5c506d957fbb`

#### 3️⃣ 初始化数据库

```bash
# 克隆项目到本地
git clone https://github.com/你的用户名/ai-tools.git
cd ai-tools

# 创建 wrangler.toml 配置文件
cat > wrangler.toml << EOF
name = "geek-tools"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "geek-tools-db"
database_id = "你的database_id"
EOF

# 初始化数据库表结构
wrangler d1 execute geek-tools-db --file=./db/schema.sql --remote
```

#### 4️⃣ 连接到 Cloudflare Pages

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 `Workers & Pages` → `Create application` → `Pages`
3. 点击 `Connect to Git`
4. 选择你 Fork 的仓库
5. 配置构建设置：
   - **Framework preset**: None
   - **Build command**: 留空
   - **Build output directory**: `/`
6. 点击 `Save and Deploy`

#### 5️⃣ 绑定 D1 数据库

1. 在 Pages 项目页面，点击 `Settings` 标签
2. 找到 `Functions` 部分
3. 找到 `D1 database bindings` 区域
4. 点击 `Add binding`
5. 填写：
   - **Variable name**: `DB`
   - **D1 database**: 选择 `geek-tools-db`
   - **Environment**: `Production`
6. 点击 `Save`

#### 6️⃣ 触发重新部署

```bash
# 提交一个空的 commit 触发部署
git commit --allow-empty -m "trigger deployment"
git push origin main
```

等待 1-2 分钟，部署完成！

#### 7️⃣ 访问你的网站

访问 `https://你的项目名.pages.dev`，开始使用！

---

## 🎯 使用指南

### 普通用户

1. **浏览工具** - 查看所有分类和工具
2. **投票** - 点击 👍 或 👎 为工具投票
3. **查看描述** - 鼠标悬停在工具卡片上查看详细描述

### 管理员

1. **进入维护模式**
   - 点击右上角 `维护模式` 按钮
   - 输入密令：`mimi`（可在代码中修改）

2. **管理分类**
   - 添加分类：点击 `➕ 添加分类`
   - 编辑分类：点击分类名称直接编辑
   - 删除分类：点击 `删除分类` 按钮
   - 排序分类：拖动分类标题栏

3. **管理工具**
   - 添加工具：点击 `➕ 添加工具`
   - 编辑工具：点击工具卡片右上角的 ✏️
   - 删除工具：点击工具卡片左上角的 ×
   - 排序工具：拖动工具卡片

---

## 🔧 配置说明

### 修改密令

编辑 `index.html`，找到以下代码：

```javascript
const CONFIG = {
    PASSWORD_HASH: 'dde6ecd6406700aa000b213c843a3091', // mimi 的 MD5
    API_ENDPOINT: '/api',
    USE_LOCAL_STORAGE: false
};
```

要修改密令，计算新密令的 MD5 值：

```bash
echo -n "你的新密令" | md5
```

将结果替换 `PASSWORD_HASH` 的值。

### 本地开发

```bash
# 安装依赖
npm install -g wrangler

# 本地开发
wrangler pages dev . --d1 DB=geek-tools-db

# 访问 http://localhost:8788
```

---

## 📊 数据库结构

### 核心表（已实现）

| 表名 | 说明 | 状态 |
|------|------|------|
| `categories` | 分类表 | ✅ 使用中 |
| `tools` | 工具表 | ✅ 使用中 |
| `votes` | 投票表 | ✅ 使用中 |

### 扩展表（已创建，待实现）

| 表名 | 说明 | 状态 |
|------|------|------|
| `comments` | 评论表（全站评论） | ⏸️ 待实现 |
| `comment_likes` | 评论点赞表 | ⏸️ 待实现 |
| `tags` | 标签表 | ⏸️ 待实现 |
| `tool_tags` | 工具标签关联表 | ⏸️ 待实现 |
| `users` | 用户表 | ⏸️ 待实现 |
| `view_logs` | 浏览记录表 | ⏸️ 待实现 |

---

## 🛠️ API 文档

### 分类管理

```bash
# 获取所有分类和工具
GET /api/categories

# 创建分类
POST /api/categories
Body: { "name": "分类名称", "description": "描述" }

# 更新分类
PUT /api/categories
Body: { "id": 1, "name": "新名称", "description": "新描述" }

# 删除分类
DELETE /api/categories?id=1
```

### 工具管理

```bash
# 创建工具
POST /api/tools
Body: { "category_id": 1, "name": "工具名", "url": "https://...", "description": "描述" }

# 更新工具
PUT /api/tools
Body: { "id": 1, "name": "新名称", "url": "https://...", "description": "新描述" }

# 删除工具
DELETE /api/tools?id=1
```

### 投票系统

```bash
# 投票
POST /api/votes
Body: { "tool_id": 1, "vote_type": "up", "user_name": "用户标识" }

# 获取投票状态
GET /api/votes?tool_id=1&user_name=xxx
```

### 排序管理

```bash
# 更新分类排序
POST /api/sort
Body: { "type": "categories", "items": [1, 2, 3] }

# 更新工具排序
POST /api/sort
Body: { "type": "tools", "category_id": 1, "items": [1, 2, 3] }
```

---

## 🎨 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **拖拽**: [SortableJS](https://sortablejs.github.io/Sortable/)
- **后端**: Cloudflare Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages
- **CDN**: Cloudflare 全球 CDN

---

## 📁 项目结构

```
ai-tools/
├── index.html              # 主页面
├── db/
│   ├── schema.sql         # 数据库表结构
│   └── migrate.js         # 数据迁移脚本
├── functions/
│   └── api/
│       ├── categories.js  # 分类管理 API
│       ├── tools.js       # 工具管理 API
│       ├── votes.js       # 投票系统 API
│       ├── sort.js        # 排序管理 API
│       └── migrate.js     # 数据迁移 API
├── wrangler.toml          # Wrangler 配置
└── README.md              # 项目文档
```

---

## 🚀 性能优化

- ✅ 使用 Cloudflare CDN 全球加速
- ✅ D1 数据库索引优化
- ✅ 按需加载数据
- ✅ 前端缓存策略
- ✅ 响应式图片加载

---

## 🔒 安全特性

- ✅ 密令 MD5 加密
- ✅ SQL 注入防护（参数化查询）
- ✅ XSS 防护
- ✅ CORS 配置
- ✅ 投票防刷（用户标识 + IP）

---

## 🐛 常见问题

### 1. 网站显示空白？

检查 D1 数据库是否正确绑定：
- Dashboard → Pages 项目 → Settings → Functions → D1 database bindings
- 确保 Variable name 是 `DB`

### 2. 添加工具没反应？

打开浏览器控制台（F12）查看错误信息，通常是：
- D1 绑定未生效（需要重新部署）
- API 调用失败（检查网络）

### 3. 如何备份数据？

```bash
# 导出数据
wrangler d1 export geek-tools-db --output=backup.sql --remote

# 恢复数据
wrangler d1 execute geek-tools-db --file=backup.sql --remote
```

### 4. 如何查看数据库内容？

```bash
# 查看所有分类
wrangler d1 execute geek-tools-db --remote --command="SELECT * FROM categories"

# 查看所有工具
wrangler d1 execute geek-tools-db --remote --command="SELECT * FROM tools"
```

---

## 🎯 路线图

- [x] 基础功能（分类、工具、投票）
- [x] 拖拽排序
- [x] 工具描述
- [x] D1 数据库迁移
- [ ] 评论系统
- [ ] 用户系统
- [ ] 标签功能
- [ ] 搜索功能
- [ ] 浏览统计
- [ ] 数据导入/导出
- [ ] 多语言支持

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

---

## 💖 致谢

- [Cloudflare Pages](https://pages.cloudflare.com/) - 免费托管
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - 免费数据库
- [SortableJS](https://sortablejs.github.io/Sortable/) - 拖拽排序库

---

## 📮 联系方式

如有问题或建议，欢迎：
- 提交 [Issue](https://github.com/bingoup886/ai-tools/issues)
- 发起 [Discussion](https://github.com/bingoup886/ai-tools/discussions)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**


# Geek工具导航站 - Cloudflare 部署指南

## 功能特性

✨ **核心功能**
- 🎯 多分类工具导航（笔记应用、开发工具、翻墙工具等）
- 👍 点赞/点踩投票系统
- 🏆 自动排名（根据投票数）
- 🔐 维护模式（密令保护）
- 📱 响应式设计

🔒 **安全特性**
- 密令：`milingmiling888`（MD5加密）
- 维护模式需要密令验证
- 前端密码验证

## 本地开发

### 1. 直接打开 HTML 文件

最简单的方式是直接在浏览器中打开 `index.html` 文件：

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

**注意**：本地开发时，数据存储在浏览器的 localStorage 中。

### 2. 使用本地服务器（推荐）

```bash
# 使用 Python
python3 -m http.server 8000

# 使用 Node.js
npx http-server -p 8000

# 使用 PHP
php -S localhost:8000
```

然后访问：http://localhost:8000

## 部署到 Cloudflare

### 方式一：Cloudflare Pages（推荐，最简单）

1. **登录 Cloudflare Dashboard**
   - 访问：https://dash.cloudflare.com/

2. **创建 Pages 项目**
   - 进入 `Pages` 页面
   - 点击 `Create a project`
   - 选择 `Upload assets`

3. **上传文件**
   - 将 `index.html` 文件上传
   - 点击 `Deploy site`

4. **配置自定义域名（可选）**
   - 在项目设置中添加自定义域名

**优点**：
- ✅ 无需配置，直接上传即可
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速
- ✅ 免费

**缺点**：
- ❌ 数据存储在浏览器 localStorage（不同设备不同步）

### 方式二：Cloudflare Workers + KV（数据持久化）

如果需要跨设备同步数据，使用 Workers + KV 存储：

#### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare

```bash
wrangler login
```

#### 3. 创建 KV 命名空间

```bash
wrangler kv:namespace create "GEEK_TOOLS_KV"
```

记录返回的 `id`，例如：
```
{ binding = "GEEK_TOOLS_KV", id = "abc123def456" }
```

#### 4. 更新 wrangler.toml

将 `wrangler.toml` 中的 `YOUR_KV_NAMESPACE_ID` 替换为上一步获得的 ID：

```toml
[[kv_namespaces]]
binding = "GEEK_TOOLS_KV"
id = "abc123def456"  # 替换为你的 KV namespace ID
```

#### 5. 修改 index.html 配置

在 `index.html` 中找到配置部分，修改为：

```javascript
const CONFIG = {
    PASSWORD_HASH: 'e10adc3949ba59abbe56e057f20f883e',
    API_ENDPOINT: '/api', // 或者你的 Worker 域名
    USE_LOCAL_STORAGE: false // 改为 false 使用 KV 存储
};
```

#### 6. 部署 Worker

```bash
wrangler deploy
```

#### 7. 上传静态文件

有两种方式：

**方式 A：使用 Workers Sites**

1. 创建 `public` 目录：
```bash
mkdir public
cp index.html public/
```

2. 修改 `wrangler.toml`，添加：
```toml
[site]
bucket = "./public"
```

3. 重新部署：
```bash
wrangler deploy
```

**方式 B：分离部署（推荐）**

1. Worker 只处理 API 请求
2. 静态文件部署到 Cloudflare Pages
3. 在 Pages 中配置环境变量指向 Worker API

## 配置说明

### 修改密令

1. 生成新密令的 MD5：
```javascript
// 在浏览器控制台运行
CryptoJS.MD5("你的新密令").toString()
```

2. 在 `index.html` 中替换 `PASSWORD_HASH`：
```javascript
const CONFIG = {
    PASSWORD_HASH: '你的新MD5值',
    // ...
};
```

### 初始化数据

编辑 `index.html` 或 `worker.js` 中的默认数据：

```javascript
data = {
    categories: [
        {
            id: '1',
            name: '你的分类名称',
            tools: [
                {
                    id: '1-1',
                    name: '工具名称',
                    url: 'https://example.com',
                    upvotes: 0,
                    downvotes: 0
                }
            ]
        }
    ]
};
```

## 使用说明

### 展示模式（默认）
- 浏览所有工具
- 点赞/点踩投票
- 查看排名

### 维护模式
1. 点击右上角"维护模式"按钮
2. 输入密令：`milingmiling888`
3. 进入维护模式后可以：
   - ➕ 添加新方向
   - ➕ 添加新工具
   - 🗑️ 删除分类/工具

## 技术栈

- **前端**：原生 HTML + CSS + JavaScript
- **加密**：CryptoJS (MD5)
- **存储**：
  - 本地：localStorage
  - 云端：Cloudflare KV
- **部署**：Cloudflare Pages / Workers

## 文件说明

```
ai-tools/
├── index.html          # 主页面（包含所有前端代码）
├── worker.js           # Cloudflare Workers 后端代码
├── wrangler.toml       # Cloudflare Workers 配置
├── DEPLOYMENT.md       # 部署文档（本文件）
└── README.md           # 项目说明
```

## 常见问题

### Q: 数据会丢失吗？
A:
- 使用 localStorage：数据存在浏览器中，清除缓存会丢失
- 使用 Cloudflare KV：数据持久化存储，不会丢失

### Q: 如何备份数据？
A:
1. 打开浏览器开发者工具（F12）
2. 进入 Console 标签
3. 运行：`console.log(JSON.stringify(data))`
4. 复制输出的 JSON 数据保存

### Q: 如何恢复数据？
A:
1. 打开浏览器开发者工具
2. 运行：`localStorage.setItem('geekToolsData', '你的JSON数据')`
3. 刷新页面

### Q: 可以自定义样式吗？
A: 可以！直接修改 `index.html` 中的 `<style>` 部分

### Q: 如何添加更多功能？
A: 修改 `index.html` 中的 JavaScript 代码，或者修改 `worker.js` 添加后端功能

## 成本

- **Cloudflare Pages**：完全免费
- **Cloudflare Workers**：
  - 免费额度：每天 100,000 请求
  - KV 存储：每月 1GB 免费
  - 对于个人使用完全足够

## 支持

如有问题，请检查：
1. 浏览器控制台是否有错误
2. Cloudflare Dashboard 中的日志
3. wrangler.toml 配置是否正确

## License

MIT License - 自由使用和修改


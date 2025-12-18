# 🚀 Geek工具导航站

一个现代化的工具导航网站，支持分类管理、投票排名、维护模式等功能。可部署在 Cloudflare 上，完全免费！

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare](https://img.shields.io/badge/deploy-Cloudflare-orange.svg)

## ✨ 特性

- 🎯 **多分类管理**：支持笔记应用、开发工具、翻墙工具等多个分类
- 👍 **投票系统**：每个工具都有点赞/点踩按钮
- 🏆 **自动排名**：根据投票数自动排序
- 🔐 **维护模式**：密令保护的编辑功能
- 📱 **响应式设计**：完美支持手机、平板、电脑
- ☁️ **云端部署**：可部署到 Cloudflare，全球加速
- 💾 **数据持久化**：支持 localStorage 或 Cloudflare KV 存储

## 🎬 快速开始

### 本地运行

1. **克隆项目**
```bash
git clone <your-repo-url>
cd ai-tools
```

2. **直接打开**
```bash
# 直接在浏览器中打开 index.html
open index.html
```

或者使用本地服务器：
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000
```

3. **访问**
```
http://localhost:8000
```

### 部署到 Cloudflare

详细部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

**最简单的方式**：
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages
3. 上传 `index.html`
4. 完成！

## 🔑 默认密令

维护模式密令：`milingmiling888`

修改密令请参考 [DEPLOYMENT.md](./DEPLOYMENT.md#修改密令)

## 📖 使用说明

### 展示模式（默认）
- 浏览所有工具分类
- 点击工具链接访问
- 为喜欢的工具点赞 👍
- 为不喜欢的工具点踩 👎
- 查看实时排名

### 维护模式
1. 点击右上角"维护模式"按钮
2. 输入密令
3. 可以进行以下操作：
   - ➕ 添加新的工具分类
   - ➕ 在分类下添加新工具
   - 🗑️ 删除分类或工具
   - 编辑工具信息

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JavaScript
- **加密**：CryptoJS (MD5)
- **存储**：localStorage / Cloudflare KV
- **部署**：Cloudflare Pages / Workers
- **CDN**：Cloudflare 全球加速

## 📁 项目结构

```
ai-tools/
├── index.html          # 主页面（包含所有前端代码）
├── worker.js           # Cloudflare Workers 后端 API
├── wrangler.toml       # Cloudflare Workers 配置文件
├── DEPLOYMENT.md       # 详细部署文档
└── README.md           # 项目说明（本文件）
```

## 🎨 自定义

### 修改样式
编辑 `index.html` 中的 `<style>` 部分，可以自定义：
- 颜色主题
- 字体样式
- 布局方式
- 动画效果

### 修改功能
编辑 `index.html` 中的 `<script>` 部分，可以：
- 添加新功能
- 修改投票逻辑
- 自定义排序规则
- 集成其他 API

### 修改初始数据
在 `index.html` 或 `worker.js` 中修改默认数据结构

## 📊 数据格式

```javascript
{
  "categories": [
    {
      "id": "1",
      "name": "分类名称",
      "tools": [
        {
          "id": "1-1",
          "name": "工具名称",
          "url": "https://example.com",
          "upvotes": 10,
          "downvotes": 2
        }
      ]
    }
  ]
}
```

## 🔒 安全性

- ✅ 密令使用 MD5 加密存储
- ✅ 维护模式需要密令验证
- ✅ 前端验证 + 后端保护（使用 Workers 时）
- ✅ CORS 配置
- ⚠️ 注意：这是一个轻量级方案，如需更高安全性，建议添加后端验证

## 💰 成本

完全免费！

- **Cloudflare Pages**：免费
- **Cloudflare Workers**：免费额度（每天 100,000 请求）
- **Cloudflare KV**：免费额度（1GB 存储）

对于个人使用或小型团队，免费额度完全足够。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Cloudflare](https://www.cloudflare.com/) - 提供免费的部署平台
- [CryptoJS](https://cryptojs.gitbook.io/) - 提供加密库

## 📮 联系方式

如有问题或建议，欢迎：
- 提交 Issue
- 发起 Pull Request
- 联系维护者

---

⭐ 如果这个项目对你有帮助，请给个 Star！


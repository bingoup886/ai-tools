# 📦 Cloudflare Pages + KV 存储配置指南

本指南教你如何在 GitHub 自动部署模式下使用 Cloudflare KV 存储数据。

## 🎯 架构说明

```
GitHub Repository
    ↓ (自动部署)
Cloudflare Pages
    ├── 静态文件 (index.html)
    └── Functions (API)
            ↓
        KV 存储 (数据持久化)
```

## ✅ 优点

- ✅ 自动部署（git push 后自动更新）
- ✅ 数据持久化（KV 存储）
- ✅ 跨设备同步
- ✅ 版本管理和回滚
- ✅ 完全免费

## 📋 配置步骤

### 步骤 1：推送代码到 GitHub

代码已经包含了必要的 Functions，直接推送：

```bash
git add .
git commit -m "feat: 添加 Pages Functions 支持 KV 存储"
git push origin main
```

### 步骤 2：在 Cloudflare 创建 Pages 项目

1. **访问 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```

2. **创建 Pages 项目**
   - 点击 `Workers & Pages`
   - 点击 `Create application`
   - 选择 `Pages` 标签
   - 点击 `Connect to Git`

3. **连接 GitHub**
   - 授权 Cloudflare 访问 GitHub
   - 选择仓库：`bingoup886/ai-tools`
   - 点击 `Begin setup`

4. **配置项目**
   - 项目名称：`geek-tools`
   - 生产分支：`main`
   - Framework preset: `None`
   - Build command: （留空）
   - Build output directory: `/`
   - 点击 `Save and Deploy`

### 步骤 3：创建 KV 命名空间（如果还没有）

#### 方式 A：通过 Dashboard

1. 在 Cloudflare Dashboard 中
2. 点击左侧 `Workers & Pages` → `KV`
3. 点击 `Create a namespace`
4. 命名为：`GEEK_TOOLS_KV`
5. 点击 `Add`

#### 方式 B：通过 Wrangler CLI

```bash
wrangler kv namespace create "GEEK_TOOLS_KV"
```

记录返回的 namespace ID，例如：`e6d3cbcfc50c45279f98ac499663669b`

### 步骤 4：绑定 KV 到 Pages 项目

这是**最关键**的一步！

1. **进入 Pages 项目设置**
   - 在 Cloudflare Dashboard 中找到你的 Pages 项目
   - 点击项目名称进入详情页

2. **配置 KV Binding**
   - 点击 `Settings` 标签
   - 滚动到 `Functions` 部分
   - 找到 `KV namespace bindings`
   - 点击 `Add binding`

3. **添加绑定**
   - Variable name: `GEEK_TOOLS_KV`（必须完全一致）
   - KV namespace: 选择 `GEEK_TOOLS_KV`
   - Environment: `Production` 和 `Preview` 都要添加
   - 点击 `Save`

4. **重新部署**
   - 回到 `Deployments` 标签
   - 点击最新的部署
   - 点击 `Retry deployment` 或者推送新代码触发部署

### 步骤 5：验证配置

1. **访问你的网站**
   ```
   https://geek-tools.pages.dev
   ```

2. **测试功能**
   - 浏览工具列表（应该显示默认数据）
   - 点赞/点踩工具
   - 刷新页面，数据应该保持

3. **测试维护模式**
   - 点击右上角"维护模式"
   - 输入密令：`milingmiling888`
   - 添加新分类或工具
   - 刷新页面，新数据应该保存

4. **跨设备测试**
   - 在另一台设备或浏览器打开
   - 数据应该同步

## 📁 项目结构

```
ai-tools/
├── index.html              # 前端页面
├── functions/              # Pages Functions (API)
│   └── api/
│       └── data.js         # 数据 API (/api/data)
├── _routes.json            # 路由配置
├── wrangler.toml           # Cloudflare 配置
└── README.md
```

## 🔧 工作原理

### 前端 (index.html)
```javascript
const CONFIG = {
    API_ENDPOINT: '/api',           // 调用 Pages Functions
    USE_LOCAL_STORAGE: false        // 使用 KV 存储
};
```

### API (functions/api/data.js)
- `GET /api/data` - 读取数据
- `POST /api/data` - 保存数据
- 数据存储在 `env.GEEK_TOOLS_KV`

### KV 存储
- Key: `data`
- Value: JSON 格式的工具数据

## 🔄 更新流程

### 修改代码
```bash
# 1. 修改 index.html 或 functions
vim index.html

# 2. 提交并推送
git add .
git commit -m "Update tools"
git push origin main

# 3. Cloudflare Pages 自动部署
# 等待 1-2 分钟即可
```

### 查看部署状态
1. 进入 Cloudflare Dashboard
2. 找到你的 Pages 项目
3. 点击 `Deployments` 查看部署历史

## 🐛 故障排查

### 问题 1：数据不保存

**检查清单：**
- [ ] KV namespace 已创建
- [ ] KV binding 已添加到 Pages 项目
- [ ] Variable name 是 `GEEK_TOOLS_KV`（大小写一致）
- [ ] Production 和 Preview 环境都已绑定
- [ ] 已重新部署

**解决方法：**
1. 进入 Pages 项目 Settings → Functions
2. 检查 KV namespace bindings
3. 如果没有，添加绑定
4. 重新部署

### 问题 2：API 404 错误

**检查清单：**
- [ ] `functions/api/data.js` 文件存在
- [ ] 文件已推送到 GitHub
- [ ] Pages 已重新部署

**解决方法：**
```bash
# 确认文件存在
ls -la functions/api/

# 重新推送
git add functions/
git commit -m "Add functions"
git push origin main
```

### 问题 3：CORS 错误

**检查：**
- Functions 中已包含 CORS 头
- 检查浏览器控制台错误信息

**解决方法：**
确保 `functions/api/data.js` 中包含：
```javascript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
}
```

### 问题 4：数据丢失

**原因：**
- 可能还在使用 localStorage
- KV binding 配置错误

**解决方法：**
1. 检查 `index.html` 中 `USE_LOCAL_STORAGE: false`
2. 检查 KV binding 配置
3. 清除浏览器缓存重试

## 📊 查看 KV 数据

### 通过 Dashboard
1. 进入 `Workers & Pages` → `KV`
2. 点击 `GEEK_TOOLS_KV`
3. 查看所有 keys
4. 点击 `data` 查看内容

### 通过 Wrangler CLI
```bash
# 列出所有 keys
wrangler kv key list --namespace-id=YOUR_NAMESPACE_ID

# 查看数据
wrangler kv key get "data" --namespace-id=YOUR_NAMESPACE_ID

# 删除数据（重置）
wrangler kv key delete "data" --namespace-id=YOUR_NAMESPACE_ID
```

## 🔐 环境变量（可选）

如果需要添加其他配置：

1. 进入 Pages 项目 Settings
2. 点击 `Environment variables`
3. 添加变量
4. 重新部署

## 💰 费用

完全免费！

- Cloudflare Pages: 免费
- Pages Functions: 免费（每天 100,000 请求）
- KV 存储: 免费（1GB 存储，每天 100,000 读取）

## 📚 相关文档

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [KV 存储文档](https://developers.cloudflare.com/kv/)
- [Pages 部署文档](https://developers.cloudflare.com/pages/get-started/)

## ✅ 配置检查清单

完成以下所有步骤：

- [ ] 代码已推送到 GitHub
- [ ] Pages 项目已创建并连接 GitHub
- [ ] KV namespace 已创建
- [ ] KV binding 已添加到 Pages 项目（Production + Preview）
- [ ] Variable name 是 `GEEK_TOOLS_KV`
- [ ] 已重新部署
- [ ] 网站可以访问
- [ ] 数据可以保存和读取
- [ ] 跨设备数据同步正常

---

**配置完成后，你就拥有了一个自动部署 + 数据持久化的工具导航站！🎉**


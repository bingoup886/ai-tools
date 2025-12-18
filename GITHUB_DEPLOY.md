# 🚀 GitHub 自动部署指南

通过 GitHub 集成，每次推送代码后自动部署到 Cloudflare Pages。

## 📋 前置条件

- ✅ 代码已推送到 GitHub
- ✅ 有 Cloudflare 账号

## 🎯 方式一：Cloudflare Pages + GitHub（推荐）

### 优点
- ✅ 自动部署（git push 后自动更新）
- ✅ 预览部署（PR 自动生成预览链接）
- ✅ 版本管理和回滚
- ✅ 构建日志
- ✅ 完全免费

### 步骤

#### 1. 登录 Cloudflare Dashboard

访问：https://dash.cloudflare.com/

#### 2. 创建 Pages 项目

1. 点击左侧 `Workers & Pages`
2. 点击 `Create application`
3. 选择 `Pages` 标签
4. 点击 `Connect to Git`

#### 3. 连接 GitHub

1. 点击 `Connect GitHub`
2. 授权 Cloudflare 访问你的 GitHub
3. 选择仓库：`ai-tools`（或你的仓库名）
4. 点击 `Begin setup`

#### 4. 配置构建设置

**项目名称：** `geek-tools`（或任意名称）

**生产分支：** `main`

**构建设置：**
- Framework preset: `None`
- Build command: （留空）
- Build output directory: `/`
- Root directory: `/`

**环境变量：**（暂时不需要）

点击 `Save and Deploy`

#### 5. 等待部署完成

- 首次部署需要 1-2 分钟
- 部署成功后会显示网址，例如：
  ```
  https://geek-tools.pages.dev
  ```

#### 6. 完成！

现在每次你推送代码到 GitHub，Cloudflare Pages 会自动部署。

---

## 🔧 方式二：Cloudflare Workers + GitHub Actions

如果你想使用 Workers 而不是 Pages，可以用 GitHub Actions。

### 步骤

#### 1. 获取 Cloudflare API Token

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 `Create Token`
3. 使用模板：`Edit Cloudflare Workers`
4. 复制生成的 Token

#### 2. 获取 Account ID

1. 在 Cloudflare Dashboard 右侧找到 Account ID
2. 复制它

#### 3. 添加 GitHub Secrets

1. 打开你的 GitHub 仓库
2. 进入 `Settings` → `Secrets and variables` → `Actions`
3. 添加以下 secrets：
   - `CLOUDFLARE_API_TOKEN`: 你的 API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 你的 Account ID

#### 4. 创建 GitHub Actions 工作流

文件已创建：`.github/workflows/deploy.yml`

#### 5. 推送代码

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

GitHub Actions 会自动部署到 Cloudflare Workers。

---

## 📝 使用 KV 存储（可选）

如果你想使用 Cloudflare KV 存储数据：

### 方式 1：通过 Cloudflare Dashboard

1. 进入 `Workers & Pages`
2. 找到你的项目
3. 点击 `Settings` → `Functions`
4. 添加 KV Namespace Binding：
   - Variable name: `GEEK_TOOLS_KV`
   - KV namespace: 选择已创建的 `GEEK_TOOLS_KV`

### 方式 2：通过 wrangler.toml

在项目根目录创建 `wrangler.toml`：

```toml
name = "geek-tools"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "GEEK_TOOLS_KV"
id = "e6d3cbcfc50c45279f98ac499663669b"
```

然后在 Pages 项目设置中启用 Functions。

### 修改 index.html 配置

```javascript
const CONFIG = {
    PASSWORD_HASH: 'e10adc3949ba59abbe56e057f20f883e',
    API_ENDPOINT: '/api',
    USE_LOCAL_STORAGE: false  // 使用 KV 存储
};
```

---

## 🎨 自定义域名

### 添加自定义域名

1. 在 Pages 项目中点击 `Custom domains`
2. 点击 `Set up a custom domain`
3. 输入你的域名，例如：`tools.yourdomain.com`
4. 按照提示添加 DNS 记录
5. 等待 DNS 生效（通常几分钟）

---

## 🔄 自动部署流程

### 推送到 main 分支

```bash
git add .
git commit -m "Update tools"
git push origin main
```

Cloudflare Pages 会自动：
1. 检测到代码变更
2. 开始构建
3. 部署到生产环境
4. 发送通知（可选）

### 预览部署（Pull Request）

1. 创建新分支：
   ```bash
   git checkout -b feature/new-tool
   ```

2. 修改代码并推送：
   ```bash
   git add .
   git commit -m "Add new tool"
   git push origin feature/new-tool
   ```

3. 在 GitHub 创建 Pull Request

4. Cloudflare Pages 会自动创建预览部署
   - 预览 URL：`https://abc123.geek-tools.pages.dev`
   - 可以在合并前测试

---

## 📊 监控和日志

### 查看部署历史

1. 进入 Cloudflare Pages 项目
2. 点击 `Deployments` 标签
3. 查看所有部署记录

### 查看构建日志

1. 点击某个部署
2. 查看详细的构建日志
3. 排查部署问题

### 回滚版本

1. 在部署历史中找到之前的版本
2. 点击 `Rollback to this deployment`
3. 确认回滚

---

## 🔐 环境变量

如果需要添加环境变量（例如 API 密钥）：

1. 进入 Pages 项目设置
2. 点击 `Environment variables`
3. 添加变量：
   - Production: 生产环境变量
   - Preview: 预览环境变量

---

## 📱 Webhook 通知（可选）

### 设置部署通知

1. 进入项目设置
2. 点击 `Notifications`
3. 添加 Webhook URL（例如 Slack、Discord）
4. 选择通知事件：
   - Deployment started
   - Deployment succeeded
   - Deployment failed

---

## 🐛 常见问题

### Q: 部署失败怎么办？
A:
1. 查看构建日志
2. 检查文件路径是否正确
3. 确认 index.html 在根目录

### Q: 如何更新已部署的网站？
A:
```bash
git add .
git commit -m "Update"
git push origin main
```
自动部署，无需手动操作。

### Q: 预览部署的 URL 是什么？
A:
- 生产：`https://geek-tools.pages.dev`
- 预览：`https://[commit-hash].geek-tools.pages.dev`

### Q: 如何删除项目？
A:
1. 进入 Pages 项目
2. Settings → Delete project
3. 确认删除

---

## 📚 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)

---

## ✅ 快速检查清单

- [ ] 代码已推送到 GitHub
- [ ] 已连接 GitHub 到 Cloudflare Pages
- [ ] 首次部署成功
- [ ] 可以访问生产 URL
- [ ] 测试自动部署（推送代码后自动更新）
- [ ] （可选）配置自定义域名
- [ ] （可选）设置 KV 存储

---

**现在你的工具导航站已经实现了 CI/CD 自动部署！🎉**

每次 `git push` 后，网站会自动更新，无需手动操作。


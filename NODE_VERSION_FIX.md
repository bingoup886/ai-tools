# Node.js 版本修复 - Cloudflare Pages

## 🔴 问题

Cloudflare Pages 默认使用 Node.js 18.17.1，但 Vite 7 需要 Node.js 20.19+ 或 22.12+

**错误信息**:
```
Vite requires Node.js version 20.19+ or 22.12+
```

---

## ✅ 解决方案

已添加以下文件来指定 Node.js 版本：

### 1. `.nvmrc` 文件
```
20.17.0
```
用于 NVM（Node Version Manager）识别

### 2. `.node-version` 文件
```
20.17.0
```
用于 Heroku、Railway 等平台识别

### 3. `package.json` 中的 `engines` 字段
```json
"engines": {
  "node": ">=20.0.0"
}
```
明确指定 Node.js 版本要求

### 4. `wrangler.toml` 中的构建配置
```toml
[env.production.vars]
NODE_VERSION = "20.17.0"
```

---

## 🚀 后续步骤

### 在 Cloudflare Pages 中重新部署

1. 代码已推送到 GitHub
2. Cloudflare Pages 会自动检测 `.nvmrc` 或 `.node-version` 文件
3. 应该会使用 Node.js 20.17.0 进行构建
4. 构建应该成功完成

### 如果还是失败

可能需要在 Cloudflare Pages UI 中设置环境变量：

**环境变量名**: `NODE_VERSION`
**环境变量值**: `20.17.0`

---

## 📝 文件变更

新增文件：
- `.nvmrc` - NVM 配置
- `.node-version` - Node 版本指定
- `wrangler-pages.toml` - Pages 特定配置
- `functions/_middleware.ts` - Functions 中间件

修改文件：
- `package.json` - 添加 engines 字段
- `wrangler.toml` - 添加环境变量配置

---

## ✨ 现在应该能正常构建了！

访问 Cloudflare Dashboard 查看构建日志，应该能看到：
- Node.js 版本为 20.17.0
- Vite 构建成功
- 输出到 dist/ 目录


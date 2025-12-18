# 🚀 快速部署指南

## 方式一：Cloudflare Pages（5分钟部署，推荐新手）

### 适合场景
- 个人使用
- 不需要跨设备同步数据
- 想要最快速度上线

### 部署步骤

1. **访问 Cloudflare Dashboard**
   ```
   https://dash.cloudflare.com/
   ```
   没有账号？点击 Sign Up 免费注册

2. **创建 Pages 项目**
   - 点击左侧 `Workers & Pages`
   - 点击 `Create application`
   - 选择 `Pages` 标签
   - 点击 `Upload assets`

3. **上传文件**
   - 项目名称：`geek-tools`（或任意名称）
   - 拖拽 `index.html` 文件到上传区
   - 点击 `Deploy site`

4. **完成！**
   - 等待 10-30 秒
   - 获得网址：`https://geek-tools.pages.dev`
   - 立即访问使用

### 更新网站
- 在 Pages 项目中点击 `Create a new deployment`
- 重新上传 `index.html`

---

## 方式二：Cloudflare Workers + KV（数据持久化）

### 适合场景
- 多设备使用
- 需要数据同步
- 团队协作

### 前置要求
- 安装 Node.js（https://nodejs.org/）
- 有 Cloudflare 账号

### 部署步骤

#### 第一步：安装工具

打开终端，执行：

```bash
npm install -g wrangler
```

#### 第二步：登录

```bash
cd /Users/yinjianbin/Projects/ai/ai-tools
wrangler login
```

浏览器会打开，点击授权。

#### 第三步：创建 KV 存储

```bash
wrangler kv namespace create "GEEK_TOOLS_KV"
```

会返回类似：
```
{ binding = "GEEK_TOOLS_KV", id = "abc123def456789" }
```

**重要：复制这个 id！**

#### 第四步：配置 wrangler.toml

打开 `wrangler.toml` 文件，找到：

```toml
[[kv_namespaces]]
binding = "GEEK_TOOLS_KV"
id = "YOUR_KV_NAMESPACE_ID"  # 这里
```

将 `YOUR_KV_NAMESPACE_ID` 替换为第三步得到的 id：

```toml
[[kv_namespaces]]
binding = "GEEK_TOOLS_KV"
id = "abc123def456789"  # 替换为你的实际 id
```

#### 第五步：修改 index.html

打开 `index.html`，找到（大约第 450 行）：

```javascript
const CONFIG = {
    PASSWORD_HASH: 'e10adc3949ba59abbe56e057f20f883e',
    API_ENDPOINT: '/api',
    USE_LOCAL_STORAGE: true  // 这里
};
```

改为：

```javascript
const CONFIG = {
    PASSWORD_HASH: 'e10adc3949ba59abbe56e057f20f883e',
    API_ENDPOINT: '/api',
    USE_LOCAL_STORAGE: false  // 改为 false
};
```

#### 第六步：部署

```bash
wrangler deploy
```

成功后会显示：
```
Published geek-tools-navigator
  https://geek-tools-navigator.your-subdomain.workers.dev
```

#### 第七步：部署前端

**选项 A：Workers Sites（前后端一起）**

```bash
mkdir public
cp index.html public/
```

修改 `wrangler.toml`，添加：
```toml
[site]
bucket = "./public"
```

重新部署：
```bash
wrangler deploy
```

**选项 B：分离部署（推荐）**

1. Worker 已经部署好了（处理 API）
2. 按照"方式一"将 `index.html` 上传到 Cloudflare Pages
3. 修改 `index.html` 中的 API 端点：
   ```javascript
   API_ENDPOINT: 'https://你的worker地址.workers.dev/api'
   ```
4. 重新上传到 Pages

---

## 🎯 推荐方案

### 个人使用 → 方式一
- 最简单
- 5分钟搞定
- 完全够用

### 团队使用 → 方式二
- 数据同步
- 更专业
- 需要一点技术

---

## 🔧 常见问题

### Q: 部署后打不开？
A: 等待 1-2 分钟，DNS 需要传播时间

### Q: 数据会丢失吗？
A:
- 方式一：清除浏览器缓存会丢失
- 方式二：永久保存在 Cloudflare

### Q: 如何备份数据？
A:
1. 打开浏览器开发者工具（F12）
2. Console 标签
3. 输入：`console.log(JSON.stringify(data))`
4. 复制输出保存

### Q: 如何修改密令？
A:
1. 访问：https://www.md5hashgenerator.com/
2. 输入新密令，生成 MD5
3. 在 `index.html` 中替换 `PASSWORD_HASH`

### Q: 费用多少？
A:
- Cloudflare Pages：完全免费
- Cloudflare Workers：免费额度（每天 10万请求）
- 个人使用完全免费

---

## 📞 需要帮助？

1. 查看详细文档：`DEPLOYMENT.md`
2. Cloudflare 文档：https://developers.cloudflare.com/
3. 检查浏览器控制台错误信息

---

## ✅ 部署检查清单

### 方式一（Pages）
- [ ] 注册 Cloudflare 账号
- [ ] 上传 index.html
- [ ] 访问生成的网址
- [ ] 测试功能正常

### 方式二（Workers + KV）
- [ ] 安装 Node.js
- [ ] 安装 wrangler
- [ ] 登录 Cloudflare
- [ ] 创建 KV 命名空间
- [ ] 更新 wrangler.toml
- [ ] 修改 index.html 配置
- [ ] 部署 Worker
- [ ] 部署前端
- [ ] 测试功能正常

---

**祝部署顺利！🎉**


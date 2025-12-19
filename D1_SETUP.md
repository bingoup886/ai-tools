# Cloudflare D1 数据库配置指南

## 📋 前置条件

- Cloudflare 账号
- Wrangler CLI 已安装
- 已有 Pages 项目

---

## 🚀 步骤一：创建 D1 数据库

### 1. 安装/更新 Wrangler

```bash
npm install -g wrangler
wrangler --version
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
wrangler d1 create geek-tools-db
```

**输出示例：**
```
✅ Successfully created DB 'geek-tools-db'

[[d1_databases]]
binding = "DB"
database_name = "geek-tools-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**重要：记下 `database_id`，后面要用！**

---

## 🗄️ 步骤二：初始化数据库表结构

### 1. 执行 schema.sql

```bash
wrangler d1 execute geek-tools-db --file=./db/schema.sql
```

### 2. 验证表创建

```bash
wrangler d1 execute geek-tools-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

**应该看到：**
```
categories
tools
votes
comments
comment_likes
tags
tool_tags
users
view_logs
```

---

## 🔗 步骤三：绑定 D1 到 Pages 项目

### 方式 A：通过 Dashboard（推荐）

1. 访问 Cloudflare Dashboard
2. 进入 `Workers & Pages`
3. 选择你的 Pages 项目（例如：`geek-tools`）
4. 点击 `Settings` 标签
5. 找到 `Functions` 部分
6. 找到 `D1 database bindings` 区域
7. 点击 `Add binding`

**填写信息：**
- **Variable name**: `DB`（必须是 DB）
- **D1 database**: 选择 `geek-tools-db`
- **Environment**: 选择 `Production`

8. 再添加一个 Preview 环境的绑定（可选）
   - **Variable name**: `DB`
   - **D1 database**: 选择 `geek-tools-db`
   - **Environment**: 选择 `Preview`

9. 点击 `Save`

### 方式 B：通过命令行

```bash
wrangler pages project bind geek-tools --binding DB=geek-tools-db
```

---

## 📦 步骤四：数据迁移（从 KV 到 D1）

### 1. 创建迁移 Function

创建文件 `functions/api/migrate.js`：

```javascript
import { migrateFromKV } from '../../db/migrate.js';

export async function onRequestPost(context) {
    const { env } = context;

    // 简单的密码保护
    const { password } = await context.request.json();

    if (password !== 'mimi') {
        return new Response(JSON.stringify({ error: '密码错误' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const result = await migrateFromKV(env);

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
}
```

### 2. 部署代码

```bash
git add .
git commit -m "feat: 迁移到 D1 数据库"
git push origin main
```

### 3. 等待部署完成（1-2分钟）

### 4. 执行迁移

访问：`https://你的域名/api/migrate`

使用 POST 请求，body：
```json
{
    "password": "mimi"
}
```

或使用 curl：
```bash
curl -X POST https://你的域名/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"password":"mimi"}'
```

### 5. 验证迁移结果

```bash
# 查看分类数量
wrangler d1 execute geek-tools-db --command="SELECT COUNT(*) as count FROM categories"

# 查看工具数量
wrangler d1 execute geek-tools-db --command="SELECT COUNT(*) as count FROM tools"

# 查看投票数量
wrangler d1 execute geek-tools-db --command="SELECT COUNT(*) as count FROM votes"
```

---

## 🔄 步骤五：更新前端代码

前端 API 调用已自动适配，无需修改。

新的 API 端点：
- `GET /api/categories` - 获取所有分类和工具
- `POST /api/categories` - 创建分类
- `PUT /api/categories` - 更新分类
- `DELETE /api/categories?id=1` - 删除分类
- `POST /api/tools` - 创建工具
- `PUT /api/tools` - 更新工具
- `DELETE /api/tools?id=1` - 删除工具
- `POST /api/votes` - 投票
- `GET /api/votes?tool_id=1&user_name=xxx` - 获取投票状态
- `POST /api/sort` - 更新排序

---

## ✅ 步骤六：验证功能

### 1. 访问网站

打开你的网站，检查：
- ✅ 分类和工具正常显示
- ✅ 投票功能正常
- ✅ 拖拽排序正常
- ✅ 添加/编辑/删除功能正常

### 2. 检查数据

```bash
# 查看所有分类
wrangler d1 execute geek-tools-db --command="SELECT * FROM categories"

# 查看所有工具
wrangler d1 execute geek-tools-db --command="SELECT * FROM tools LIMIT 10"

# 查看投票统计
wrangler d1 execute geek-tools-db --command="
SELECT
    t.name,
    COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as upvotes,
    COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as downvotes
FROM tools t
LEFT JOIN votes v ON t.id = v.tool_id
GROUP BY t.id
"
```

---

## 🗑️ 步骤七：清理 KV（可选）

数据迁移成功后，可以删除 KV 绑定：

1. 进入 Pages 项目设置
2. 找到 `KV namespace bindings`
3. 删除 `GEEK_TOOLS_KV` 绑定

**注意：删除前请确保数据已完整迁移！**

---

## 📊 D1 数据库管理

### 查询数据

```bash
# 执行 SQL 查询
wrangler d1 execute geek-tools-db --command="SELECT * FROM categories"

# 执行 SQL 文件
wrangler d1 execute geek-tools-db --file=./query.sql
```

### 备份数据

```bash
# 导出数据
wrangler d1 export geek-tools-db --output=backup.sql
```

### 恢复数据

```bash
# 导入数据
wrangler d1 execute geek-tools-db --file=backup.sql
```

---

## 🐛 常见问题

### 1. 找不到 DB 绑定

**错误**：`DB is not defined`

**解决**：
- 检查 Pages 项目设置中是否正确绑定了 D1
- Variable name 必须是 `DB`
- 重新部署项目

### 2. 数据迁移失败

**解决**：
- 检查 KV 中是否有数据
- 查看迁移日志
- 手动执行 SQL 插入

### 3. 投票功能异常

**解决**：
- 检查 votes 表是否有数据
- 查看浏览器控制台错误
- 检查 user_name 是否正确传递

---

## 📈 性能优化

### 1. 索引优化

所有必要的索引已在 schema.sql 中创建。

### 2. 查询优化

- 使用 `LIMIT` 限制结果数量
- 避免 `SELECT *`，只查询需要的字段
- 使用 `JOIN` 代替多次查询

### 3. 缓存策略

可以在 Pages Functions 中添加缓存：

```javascript
const cache = await caches.default;
const cacheKey = new Request(url, request);
let response = await cache.match(cacheKey);

if (!response) {
    // 查询数据库
    response = new Response(data);
    await cache.put(cacheKey, response.clone());
}
```

---

## 🎯 下一步

- [ ] 实现评论功能
- [ ] 添加用户系统
- [ ] 实现标签功能
- [ ] 添加浏览统计

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. Wrangler 版本是否最新
2. D1 绑定是否正确
3. 数据库表是否创建成功
4. API 端点是否正确

祝你使用愉快！🎉


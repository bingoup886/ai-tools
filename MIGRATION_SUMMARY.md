# 数据库迁移总结

## ✅ 已完成的工作

### 1. 数据库设计
- ✅ 创建了 9 个表的完整 schema
- ✅ 设计了索引优化查询性能
- ✅ 支持未来扩展（评论、标签、用户等）

### 2. 后端 API（全新）
创建了以下 API 文件：

#### `/functions/api/categories.js`
- `GET` - 获取所有分类和工具（带投票统计）
- `POST` - 创建分类
- `PUT` - 更新分类
- `DELETE` - 删除分类

#### `/functions/api/tools.js`
- `POST` - 创建工具
- `PUT` - 更新工具
- `DELETE` - 删除工具

#### `/functions/api/votes.js`
- `POST` - 投票/取消投票/更改投票
- `GET` - 获取用户投票状态

#### `/functions/api/sort.js`
- `POST` - 更新分类或工具的排序

#### `/functions/api/migrate.js`
- `POST` - 从 KV 迁移数据到 D1

### 3. 数据库文件
- ✅ `/db/schema.sql` - 完整的表结构
- ✅ `/db/migrate.js` - 迁移逻辑（备用）
- ✅ `/D1_SETUP.md` - 详细的配置文档

---

## 🔄 前端需要的修改

前端代码基本不需要大改，只需要调整 API 调用方式：

### 当前前端逻辑
```javascript
// 当前：直接保存整个 data 对象
await fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(data)
});
```

### 新的 API 调用方式

前端已经配置为使用 `/api` 端点，新的 API 会自动返回正确的数据格式。

**主要变化：**
1. `GET /api/categories` 返回的数据格式与之前兼容
2. 拖拽排序需要调用 `/api/sort` 保存顺序
3. 投票需要调用 `/api/votes` 而不是保存整个数据

---

## 📋 接下来的步骤

### 步骤 1：创建 D1 数据库
```bash
wrangler d1 create geek-tools-db
```

### 步骤 2：初始化表结构
```bash
wrangler d1 execute geek-tools-db --file=./db/schema.sql
```

### 步骤 3：绑定 D1 到 Pages
在 Cloudflare Dashboard 中：
- Pages 项目 → Settings → Functions → D1 database bindings
- Variable name: `DB`
- Database: `geek-tools-db`

### 步骤 4：部署代码
```bash
git add .
git commit -m "feat: 迁移到 D1 数据库"
git push origin main
```

### 步骤 5：执行数据迁移
```bash
curl -X POST https://你的域名/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"password":"mimi"}'
```

### 步骤 6：验证功能
- 访问网站，检查所有功能是否正常
- 检查投票、排序、添加/编辑/删除功能

### 步骤 7：删除旧文件（可选）
- 删除 `/functions/api/data.js`（已被新 API 替代）
- 删除 KV 绑定（数据迁移成功后）

---

## 🎯 API 对比

### 旧 API（KV）
```
GET  /api/data  - 获取所有数据
POST /api/data  - 保存所有数据
```

### 新 API（D1）
```
GET    /api/categories           - 获取所有分类和工具
POST   /api/categories           - 创建分类
PUT    /api/categories           - 更新分类
DELETE /api/categories?id=1      - 删除分类

POST   /api/tools                - 创建工具
PUT    /api/tools                - 更新工具
DELETE /api/tools?id=1           - 删除工具

POST   /api/votes                - 投票
GET    /api/votes?tool_id=1      - 获取投票状态

POST   /api/sort                 - 更新排序

POST   /api/migrate              - 数据迁移
```

---

## 📊 数据结构对比

### KV 数据结构
```json
{
  "categories": [
    {
      "id": "1",
      "name": "分类名",
      "tools": [
        {
          "id": "1-1",
          "name": "工具名",
          "url": "https://...",
          "description": "描述",
          "upvotes": 10,
          "downvotes": 2
        }
      ]
    }
  ]
}
```

### D1 返回格式（兼容）
```json
{
  "categories": [
    {
      "id": 1,
      "name": "分类名",
      "sort_order": 0,
      "tools": [
        {
          "id": 1,
          "name": "工具名",
          "url": "https://...",
          "description": "描述",
          "upvotes": 10,
          "downvotes": 2,
          "sort_order": 0
        }
      ]
    }
  ]
}
```

**主要区别：**
- ID 从字符串变为数字
- 新增 `sort_order` 字段
- 投票数通过 SQL 聚合计算

---

## 🔧 前端需要调整的地方

### 1. 保存数据逻辑

**旧代码（需要删除）：**
```javascript
async function saveData() {
    await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}
```

**新代码：**
```javascript
// 不需要 saveData 函数
// 每个操作直接调用对应的 API
```

### 2. 拖拽排序保存

**需要添加：**
```javascript
async function saveCategoryOrder() {
    const categoryIds = data.categories.map(c => c.id);
    await fetch('/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'categories',
            items: categoryIds
        })
    });
}

async function saveToolOrder(categoryId) {
    const category = data.categories.find(c => c.id === categoryId);
    const toolIds = category.tools.map(t => t.id);
    await fetch('/api/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'tools',
            category_id: categoryId,
            items: toolIds
        })
    });
}
```

### 3. 投票逻辑

**需要修改：**
```javascript
async function vote(categoryId, toolId, voteType) {
    const userIdentifier = localStorage.getItem('userIdentifier') ||
                          'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userIdentifier', userIdentifier);

    const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tool_id: toolId,
            vote_type: voteType,
            user_name: userIdentifier
        })
    });

    const result = await response.json();

    // 重新加载数据
    await loadData();
    renderCategories();
}
```

---

## ⚠️ 注意事项

1. **ID 类型变化**
   - KV: 字符串 ID（如 "1", "1-1"）
   - D1: 数字 ID（如 1, 2, 3）
   - 前端比较时注意类型转换

2. **投票记录**
   - KV: 只存储总数
   - D1: 存储每条投票记录
   - 支持查询用户投票历史

3. **排序字段**
   - 新增 `sort_order` 字段
   - 拖拽后需要调用 `/api/sort` 保存

4. **数据迁移**
   - 迁移后 KV 数据不会自动删除
   - 建议保留 KV 数据一段时间作为备份
   - 确认无误后再删除 KV 绑定

---

## 🎉 迁移完成后的优势

1. **更强的查询能力**
   - 支持复杂的 SQL 查询
   - 可以按各种条件筛选和排序

2. **更好的扩展性**
   - 轻松添加评论功能
   - 支持用户系统
   - 支持标签系统

3. **更高的性能**
   - 索引优化查询速度
   - 不需要读取整个数据集

4. **更好的数据完整性**
   - 外键约束
   - 事务支持
   - 数据验证

---

需要帮助请参考 `D1_SETUP.md` 文档！


# 📌 版本管理快速指南

本文档说明如何在项目中进行版本管理和变更记录。

## 🎯 快速开始

### 记录变更的 3 个步骤

#### 1️⃣ 进行代码改动

```bash
# 在 preview 分支上工作
git checkout preview

# 进行你的改动
# ... 编辑文件 ...

# 提交改动
git add .
git commit -m "feat: 添加新功能"
git push origin preview
```

#### 2️⃣ 更新 CHANGELOG.md

在 `CHANGELOG.md` 的 `[Unreleased]` 部分添加你的变更：

```markdown
## [Unreleased]

### ✨ 新增功能
- 你的新功能

### 🔄 改进
- 你的改进

### 🐛 修复
- 你的修复

### 📚 文档
- 文档更新
```

#### 3️⃣ 合并到 main 并发布版本

```bash
# 切换到 main
git checkout main
git pull origin main

# 合并 preview
git merge preview

# 更新 CHANGELOG - 将 [Unreleased] 改为版本号
# 例如：[1.1.0] - 2026-01-01

# 提交并推送
git add CHANGELOG.md
git commit -m "chore: 发布版本 1.1.0"
git push origin main

# 创建标签（可选但推荐）
git tag v1.1.0
git push origin v1.1.0
```

---

## 📋 CHANGELOG 格式

### 完整的变更条目示例

```markdown
## [1.2.0] - 2026-01-15

### ✨ 新增功能
- 用户搜索功能
- 分类折叠/展开功能

### 🔄 改进
- 优化了投票按钮的响应速度
- 改进了移动端布局

### 🐛 修复
- 修复了拖拽排序在 Safari 上的问题
- 修复了密码验证的 bug

### 📚 文档
- 更新了 README.md
- 添加了 API 文档

### 🔧 技术细节
- 升级 React 到 19.3.0
- 优化了数据库查询
```

### 变更类型说明

| 类型 | 符号 | 说明 | 示例 |
|------|------|------|------|
| 新增功能 | ✨ | 新增的功能特性 | 添加搜索功能 |
| 改进 | 🔄 | 优化或改进现有功能 | 优化页面加载速度 |
| 修复 | 🐛 | 修复 bug | 修复投票计数错误 |
| 文档 | 📚 | 文档相关更新 | 更新 README |
| 技术 | 🔧 | 技术实现细节 | 升级依赖版本 |
| 破坏性改变 | ⚠️ | 不兼容的改变 | API 接口改变 |

---

## 📊 版本号规则

### 语义版本控制 (Semantic Versioning)

格式：`MAJOR.MINOR.PATCH`

```
1.2.3
│ │ └─ PATCH (补丁) - 修复 bug
│ └─── MINOR (小版本) - 新增功能
└───── MAJOR (大版本) - 破坏性改变
```

### 版本递增规则

| 情况 | 递增方式 | 示例 |
|------|---------|------|
| 新增功能，向下兼容 | MINOR + 1 | 1.0.0 → 1.1.0 |
| 修复 bug，向下兼容 | PATCH + 1 | 1.1.0 → 1.1.1 |
| 破坏性改变 | MAJOR + 1 | 1.2.3 → 2.0.0 |
| 重大改版 | 重置 MINOR 和 PATCH | 1.9.9 → 2.0.0 |

### 版本示例

```
1.0.0  - 初始版本
1.0.1  - 修复 bug
1.1.0  - 新增功能
1.1.1  - 修复 bug
1.2.0  - 新增多个功能
2.0.0  - 大版本更新（破坏性改变）
```

---

## 🔄 工作流程

### 完整的发布流程

```
1. 在 preview 分支进行开发
   ↓
2. 进行代码改动和提交
   ↓
3. 在 CHANGELOG.md 的 [Unreleased] 部分记录变更
   ↓
4. 测试预览版本
   ↓
5. 合并 preview 到 main
   ↓
6. 在 CHANGELOG.md 中创建新版本条目
   ↓
7. 创建 git 标签
   ↓
8. Cloudflare 自动部署生产版本
```

### 快速命令参考

```bash
# 开发阶段
git checkout preview
git add .
git commit -m "feat: 功能描述"
git push origin preview

# 发布阶段
git checkout main
git pull origin main
git merge preview
# 编辑 CHANGELOG.md
git add CHANGELOG.md
git commit -m "chore: 发布版本 X.Y.Z"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z

# 清理
git branch -d preview
git push origin --delete preview
```

---

## 📝 常见问题

### Q: 如何知道应该递增哪个版本号？

**A:** 根据变更的影响范围：

- **PATCH** (1.1.x) - 只修复 bug，不改变功能
- **MINOR** (1.x.0) - 新增功能，向下兼容
- **MAJOR** (x.0.0) - 破坏性改变，不兼容旧版本

### Q: 一个版本中有多个功能应该怎么记录？

**A:** 按类型分组，每个类型下列出所有相关的变更：

```markdown
## [1.2.0] - 2026-01-15

### ✨ 新增功能
- 功能 A
- 功能 B
- 功能 C

### 🔄 改进
- 改进 1
- 改进 2
```

### Q: 发布版本后发现 bug 应该怎么做？

**A:** 创建 hotfix 分支，修复 bug，然后发布 PATCH 版本：

```bash
git checkout main
git checkout -b hotfix/bug-fix
# 修复 bug
git commit -m "fix: 修复 bug 描述"
git checkout main
git merge hotfix/bug-fix
# 更新 CHANGELOG - 版本号 +0.0.1
git tag vX.Y.Z
git push origin main vX.Y.Z
```

### Q: 如何查看历史版本？

**A:** 使用 git 标签查看：

```bash
# 查看所有标签
git tag

# 查看特定版本的信息
git show v1.1.0

# 查看从某个版本以来的改动
git log v1.0.0..v1.1.0
```

---

## 📚 参考资源

- [Keep a Changelog](https://keepachangelog.com/) - 变更日志最佳实践
- [Semantic Versioning](https://semver.org/) - 语义版本控制规范
- [Git 标签](https://git-scm.com/book/zh/v2/Git-基础-打标签) - Git 标签使用指南

---

## 🎯 最佳实践

### ✅ 推荐做法

1. **定期更新 CHANGELOG** - 不要等到发布时才更新
2. **清晰的变更描述** - 用户应该能理解每个变更
3. **创建版本标签** - 方便追踪历史版本
4. **遵循语义版本** - 让用户知道版本的兼容性
5. **分组组织变更** - 按类型分组便于阅读

### ❌ 避免做法

1. ❌ 不更新 CHANGELOG
2. ❌ 随意递增版本号
3. ❌ 混乱的变更描述
4. ❌ 忘记创建标签
5. ❌ 发布不稳定的版本

---

## 📞 需要帮助？

查看 `CHANGELOG.md` 了解项目历史版本。

---

**最后更新**: 2026-01-01
**版本**: 1.0


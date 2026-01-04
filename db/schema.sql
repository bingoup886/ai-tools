-- Geek Tools Database Schema
-- SQLite / Cloudflare D1

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    description TEXT,
    sort_order  INTEGER  DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order);

-- 2. 工具表
CREATE TABLE IF NOT EXISTS tools
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    url         TEXT    NOT NULL,
    description TEXT,
    icon_url    TEXT,
    sort_order  INTEGER  DEFAULT 0,
    status      TEXT     DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    view_count  INTEGER  DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tools_category ON tools (category_id);
CREATE INDEX IF NOT EXISTS idx_tools_sort ON tools (category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools (status);

-- 3. 投票表
CREATE TABLE IF NOT EXISTS votes
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id    INTEGER NOT NULL,
    user_id    INTEGER,
    user_name  TEXT,
    vote_type  TEXT    NOT NULL CHECK (vote_type IN ('up', 'down')),
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    UNIQUE (tool_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_tool ON votes (tool_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes (user_id);
CREATE INDEX IF NOT EXISTS idx_votes_type ON votes (tool_id, vote_type);

-- 4. 评论表（全站评论）
CREATE TABLE IF NOT EXISTS comments
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id  INTEGER,
    user_id    INTEGER,
    user_name  TEXT NOT NULL,
    content    TEXT NOT NULL,
    ip_address TEXT,
    status     TEXT     DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
    is_pinned  INTEGER  DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_pinned ON comments (is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments (user_id);

-- 5. 评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id    INTEGER,
    user_name  TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes (comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON comment_likes (user_id);

-- 6. 标签表（待扩展）
CREATE TABLE IF NOT EXISTS tags
(
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    color       TEXT     DEFAULT '#667eea',
    icon        TEXT,
    sort_order  INTEGER  DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags (slug);
CREATE INDEX IF NOT EXISTS idx_tags_sort ON tags (sort_order);

-- 7. 工具标签关联表（待扩展）
CREATE TABLE IF NOT EXISTS tool_tags
(
    tool_id    INTEGER NOT NULL,
    tag_id     INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tool_id, tag_id),
    FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tool_tags_tool ON tool_tags (tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_tags_tag ON tool_tags (tag_id);

-- 8. 用户表（待扩展）
CREATE TABLE IF NOT EXISTS users
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name  TEXT,
    avatar_url    TEXT,
    bio           TEXT,
    role          TEXT     DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    status        TEXT     DEFAULT 'active' CHECK (status IN ('active', 'banned', 'deleted')),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- 9. 浏览记录表（待扩展）
CREATE TABLE IF NOT EXISTS view_logs
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id    INTEGER NOT NULL,
    user_id    INTEGER,
    user_name  TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referer    TEXT,
    country    TEXT,
    city       TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tools (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_view_logs_tool ON view_logs (tool_id);
CREATE INDEX IF NOT EXISTS idx_view_logs_date ON view_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_view_logs_user ON view_logs (user_id);


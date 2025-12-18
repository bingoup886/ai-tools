#!/bin/bash

# Cloudflare Workers + KV 部署脚本

echo "🚀 开始部署 Geek 工具导航站到 Cloudflare..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null
then
    echo "❌ 未检测到 wrangler，正在安装..."
    npm install -g wrangler
fi

# 登录 Cloudflare
echo "📝 请登录 Cloudflare..."
wrangler login

# 创建 KV 命名空间
echo "📦 创建 KV 命名空间..."
echo "请记录下面返回的 id，并更新到 wrangler.toml 文件中"
wrangler kv namespace create "GEEK_TOOLS_KV"

echo ""
echo "⚠️  重要步骤："
echo "1. 复制上面返回的 KV namespace id"
echo "2. 打开 wrangler.toml 文件"
echo "3. 将 YOUR_KV_NAMESPACE_ID 替换为实际的 id"
echo "4. 在 index.html 中将 USE_LOCAL_STORAGE 改为 false"
echo ""
read -p "完成上述步骤后，按回车继续部署..."

# 部署 Worker
echo "🚀 部署 Worker..."
wrangler deploy

echo ""
echo "✅ 部署完成！"
echo "📝 接下来："
echo "1. 访问 https://dash.cloudflare.com/"
echo "2. 进入 Workers & Pages"
echo "3. 找到你的 Worker，查看 URL"
echo "4. 或者将 index.html 上传到 Cloudflare Pages"


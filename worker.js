// Cloudflare Workers 后端代码
// 用于存储和管理工具导航站的数据

import {getAssetFromKV} from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 获取数据
      if (path === '/api/data' && request.method === 'GET') {
        const data = await env.GEEK_TOOLS_KV.get('data', { type: 'json' });

        if (!data) {
          // 返回默认数据
          const defaultData = {
            categories: [
              {
                id: '1',
                name: '笔记应用',
                tools: [
                  { id: '1-1', name: 'Notion', url: 'https://notion.so', upvotes: 15, downvotes: 2 },
                  { id: '1-2', name: 'Obsidian', url: 'https://obsidian.md', upvotes: 12, downvotes: 1 },
                  { id: '1-3', name: 'Roam Research', url: 'https://roamresearch.com', upvotes: 8, downvotes: 3 }
                ]
              },
              {
                id: '2',
                name: '开发工具',
                tools: [
                  { id: '2-1', name: 'VS Code', url: 'https://code.visualstudio.com', upvotes: 25, downvotes: 1 },
                  { id: '2-2', name: 'JetBrains', url: 'https://jetbrains.com', upvotes: 20, downvotes: 3 },
                  { id: '2-3', name: 'Sublime Text', url: 'https://sublimetext.com', upvotes: 10, downvotes: 2 }
                ]
              },
              {
                id: '3',
                name: '翻墙工具',
                tools: [
                  { id: '3-1', name: 'Clash', url: 'https://github.com/Dreamacro/clash', upvotes: 18, downvotes: 2 },
                  { id: '3-2', name: 'V2Ray', url: 'https://v2ray.com', upvotes: 16, downvotes: 1 },
                  { id: '3-3', name: 'Shadowsocks', url: 'https://shadowsocks.org', upvotes: 14, downvotes: 3 }
                ]
              }
            ]
          };

          return new Response(JSON.stringify(defaultData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 保存数据
      if (path === '/api/data' && request.method === 'POST') {
        const data = await request.json();
        await env.GEEK_TOOLS_KV.put('data', JSON.stringify(data));

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 投票接口
      if (path === '/api/vote' && request.method === 'POST') {
        const { categoryId, toolId, type } = await request.json();
        const data = await env.GEEK_TOOLS_KV.get('data', { type: 'json' });

        if (!data) {
          return new Response(JSON.stringify({ error: 'Data not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const category = data.categories.find(c => c.id === categoryId);
        if (!category) {
          return new Response(JSON.stringify({ error: 'Category not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const tool = category.tools.find(t => t.id === toolId);
        if (!tool) {
          return new Response(JSON.stringify({ error: 'Tool not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (type === 'up') {
          tool.upvotes = (tool.upvotes || 0) + 1;
        } else if (type === 'down') {
          tool.downvotes = (tool.downvotes || 0) + 1;
        }

        await env.GEEK_TOOLS_KV.put('data', JSON.stringify(data));

        return new Response(JSON.stringify({ success: true, tool }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 如果不是 API 请求，尝试返回静态文件
      try {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: JSON.parse(__STATIC_CONTENT_MANIFEST),
          }
        );
      } catch (e) {
        // 如果静态文件不存在，返回 404
        return new Response('Not Found', {
          status: 404,
          headers: corsHeaders
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};


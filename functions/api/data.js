// Cloudflare Pages Function - 数据 API
// 路径: /api/data

export async function onRequestGet(context) {
  const { env } = context;

  try {
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    await env.GEEK_TOOLS_KV.put('data', JSON.stringify(data));

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}


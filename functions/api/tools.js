// API: 工具管理

// 创建工具
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { category_id, name, url, description } = await request.json();

        if (!category_id || !name || !url) {
            return new Response(JSON.stringify({ error: '参数不完整' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 获取该分类下当前最大排序值
        const maxSortResult = await env.DB.prepare(`
            SELECT COALESCE(MAX(sort_order), -1) as max_sort
            FROM tools
            WHERE category_id = ?
        `).bind(category_id).first();

        const sortOrder = (maxSortResult?.max_sort || 0) + 1;

        // 插入新工具
        const result = await env.DB.prepare(`
            INSERT INTO tools (category_id, name, url, description, sort_order, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        `).bind(category_id, name, url, description || null, sortOrder).run();

        return new Response(JSON.stringify({
            success: true,
            id: result.meta.last_row_id
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('创建工具失败:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// 更新工具
export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        const { id, name, url, description } = await request.json();

        if (!id || !name || !url) {
            return new Response(JSON.stringify({ error: '参数不完整' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        await env.DB.prepare(`
            UPDATE tools
            SET name = ?, url = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(name, url, description || null, id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('更新工具失败:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// 删除工具
export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: '缺少工具ID' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        await env.DB.prepare(`
            DELETE FROM tools WHERE id = ?
        `).bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('删除工具失败:', error);
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
            'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}


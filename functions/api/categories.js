// API: 获取所有分类和工具
export async function onRequestGet(context) {
    const { env } = context;

    try {
        // 获取所有分类（按排序）
        const categoriesResult = await env.DB.prepare(`
            SELECT * FROM categories
            ORDER BY sort_order ASC
        `).all();

        const categories = categoriesResult.results || [];

        // 为每个分类获取工具、投票统计和标签
        for (const category of categories) {
            const toolsResult = await env.DB.prepare(`
                SELECT
                    t.*,
                    COUNT(CASE WHEN v.vote_type = 'up' THEN 1 END) as upvotes,
                    COUNT(CASE WHEN v.vote_type = 'down' THEN 1 END) as downvotes
                FROM tools t
                LEFT JOIN votes v ON t.id = v.tool_id
                WHERE t.category_id = ? AND t.status = 'active'
                GROUP BY t.id
                ORDER BY t.sort_order ASC
            `).bind(category.id).all();

            const tools = toolsResult.results || [];

            // 为每个工具获取标签
            for (const tool of tools) {
                const tagsResult = await env.DB.prepare(`
                    SELECT t.id, t.name, t.slug, t.description, t.color, t.icon
                    FROM tags t
                    INNER JOIN tool_tags tt ON t.id = tt.tag_id
                    WHERE tt.tool_id = ?
                    ORDER BY t.sort_order ASC
                `).bind(tool.id).all();

                tool.tags = tagsResult.results || [];
            }

            category.tools = tools;
        }

        return new Response(JSON.stringify({ categories }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('获取分类失败:', error);
        return new Response(JSON.stringify({
            error: error.message,
            categories: []
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// API: 创建分类
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { name, description } = await request.json();

        if (!name) {
            return new Response(JSON.stringify({ error: '分类名称不能为空' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 获取当前最大排序值
        const maxSortResult = await env.DB.prepare(`
            SELECT COALESCE(MAX(sort_order), -1) as max_sort FROM categories
        `).first();

        const sortOrder = (maxSortResult?.max_sort || 0) + 1;

        // 插入新分类
        const result = await env.DB.prepare(`
            INSERT INTO categories (name, description, sort_order)
            VALUES (?, ?, ?)
        `).bind(name, description || null, sortOrder).run();

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
        console.error('创建分类失败:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// API: 更新分类
export async function onRequestPut(context) {
    const { request, env } = context;

    try {
        const { id, name, description } = await request.json();

        if (!id || !name) {
            return new Response(JSON.stringify({ error: '参数错误' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        await env.DB.prepare(`
            UPDATE categories
            SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(name, description || null, id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('更新分类失败:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// API: 删除分类
export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return new Response(JSON.stringify({ error: '缺少分类ID' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        await env.DB.prepare(`
            DELETE FROM categories WHERE id = ?
        `).bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('删除分类失败:', error);
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
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}


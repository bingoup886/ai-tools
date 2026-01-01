// API: 获取所有分类和工具
export async function onRequestGet(context) {
    const { env } = context;

    try {
        // 优化：一次性查询获取所有分类、工具、投票和标签数据
        const result = await env.DB.prepare(`
            SELECT
                c.id as category_id,
                c.name as category_name,
                c.description as category_description,
                c.sort_order as category_sort_order,
                c.created_at as category_created_at,
                c.updated_at as category_updated_at,
                t.id as tool_id,
                t.name as tool_name,
                t.url as tool_url,
                t.description as tool_description,
                t.sort_order as tool_sort_order,
                t.status as tool_status,
                t.created_at as tool_created_at,
                t.updated_at as tool_updated_at,
                COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 1 ELSE 0 END), 0) as upvotes,
                COALESCE(SUM(CASE WHEN v.vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes,
                tg.id as tag_id,
                tg.name as tag_name,
                tg.slug as tag_slug,
                tg.description as tag_description,
                tg.color as tag_color,
                tg.icon as tag_icon,
                tg.sort_order as tag_sort_order
            FROM categories c
            LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
            LEFT JOIN votes v ON t.id = v.tool_id
            LEFT JOIN tool_tags tt ON t.id = tt.tool_id
            LEFT JOIN tags tg ON tt.tag_id = tg.id
            ORDER BY c.sort_order ASC, t.sort_order ASC, tg.sort_order ASC
        `).all();

        // 后处理：将扁平数据转换为嵌套结构
        const categoriesMap = new Map();
        const toolsMap = new Map();

        for (const row of result.results || []) {
            // 处理分类
            if (!categoriesMap.has(row.category_id)) {
                categoriesMap.set(row.category_id, {
                    id: row.category_id,
                    name: row.category_name,
                    description: row.category_description,
                    sort_order: row.category_sort_order,
                    created_at: row.category_created_at,
                    updated_at: row.category_updated_at,
                    tools: []
                });
            }

            // 处理工具
            if (row.tool_id) {
                if (!toolsMap.has(row.tool_id)) {
                    toolsMap.set(row.tool_id, {
                        id: row.tool_id,
                        name: row.tool_name,
                        url: row.tool_url,
                        description: row.tool_description,
                        sort_order: row.tool_sort_order,
                        status: row.tool_status,
                        created_at: row.tool_created_at,
                        updated_at: row.tool_updated_at,
                        category_id: row.category_id,
                        upvotes: row.upvotes,
                        downvotes: row.downvotes,
                        tags: []
                    });
                    categoriesMap.get(row.category_id).tools.push(toolsMap.get(row.tool_id));
                }

                // 处理标签
                if (row.tag_id && !toolsMap.get(row.tool_id).tags.some(t => t.id === row.tag_id)) {
                    toolsMap.get(row.tool_id).tags.push({
                        id: row.tag_id,
                        name: row.tag_name,
                        slug: row.tag_slug,
                        description: row.tag_description,
                        color: row.tag_color,
                        icon: row.tag_icon,
                        sort_order: row.tag_sort_order
                    });
                }
            }
        }

        const categories = Array.from(categoriesMap.values());

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


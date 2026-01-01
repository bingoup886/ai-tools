// API: 排序管理

// 更新分类排序
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { type, items, category_id } = body;

        if (!type || !items || !Array.isArray(items)) {
            return new Response(JSON.stringify({ error: '参数错误' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        if (type === 'categories') {
            // 更新分类排序
            console.log('Updating category sort order:', items);
            for (let i = 0; i < items.length; i++) {
                console.log(`Setting category ${items[i]} to sort_order ${i}`);
                await env.DB.prepare(`
                    UPDATE categories
                    SET sort_order = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(i, items[i]).run();
            }
            console.log('Category sort order updated successfully');
        } else if (type === 'tools') {
            // 更新工具排序
            if (!category_id) {
                return new Response(JSON.stringify({ error: '缺少分类ID' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            for (let i = 0; i < items.length; i++) {
                await env.DB.prepare(`
                    UPDATE tools
                    SET sort_order = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND category_id = ?
                `).bind(i, items[i], category_id).run();
            }
        } else {
            return new Response(JSON.stringify({ error: '未知的排序类型' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('更新排序失败:', error);
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}


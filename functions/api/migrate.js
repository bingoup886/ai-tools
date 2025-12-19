// API: 数据迁移（从 KV 到 D1）

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // 简单的密码保护
        const { password } = await request.json();

        if (password !== 'mimi') {
            return new Response(JSON.stringify({ error: '密码错误' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        console.log('开始从 KV 迁移数据到 D1...');

        // 1. 从 KV 读取数据
        const kvData = await env.GEEK_TOOLS_KV.get('data', { type: 'json' });

        if (!kvData || !kvData.categories) {
            return new Response(JSON.stringify({
                success: true,
                message: 'KV 中没有数据，跳过迁移'
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        console.log(`找到 ${kvData.categories.length} 个分类`);

        let totalTools = 0;
        let totalVotes = 0;

        // 2. 迁移分类和工具
        for (let i = 0; i < kvData.categories.length; i++) {
            const category = kvData.categories[i];

            // 插入分类
            const categoryResult = await env.DB.prepare(`
                INSERT INTO categories (name, description, sort_order, created_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
                category.name,
                category.description || null,
                i
            ).run();

            const newCategoryId = categoryResult.meta.last_row_id;
            console.log(`迁移分类: ${category.name} (ID: ${newCategoryId})`);

            // 迁移该分类下的工具
            if (category.tools && category.tools.length > 0) {
                for (let j = 0; j < category.tools.length; j++) {
                    const tool = category.tools[j];

                    // 插入工具
                    const toolResult = await env.DB.prepare(`
                        INSERT INTO tools (
                            category_id, name, url, description,
                            sort_order, status, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
                    `).bind(
                        newCategoryId,
                        tool.name,
                        tool.url,
                        tool.description || null,
                        j
                    ).run();

                    const newToolId = toolResult.meta.last_row_id;
                    totalTools++;

                    console.log(`  迁移工具: ${tool.name} (ID: ${newToolId})`);

                    // 迁移投票数据（创建虚拟投票记录）
                    const upvotes = tool.upvotes || 0;
                    const downvotes = tool.downvotes || 0;

                    // 为每个投票创建一条记录
                    for (let k = 0; k < upvotes; k++) {
                        await env.DB.prepare(`
                            INSERT INTO votes (
                                tool_id, user_id, user_name, vote_type, created_at
                            )
                            VALUES (?, NULL, ?, 'up', CURRENT_TIMESTAMP)
                        `).bind(
                            newToolId,
                            `历史用户_${newToolId}_up_${k}`
                        ).run();
                        totalVotes++;
                    }

                    for (let k = 0; k < downvotes; k++) {
                        await env.DB.prepare(`
                            INSERT INTO votes (
                                tool_id, user_id, user_name, vote_type, created_at
                            )
                            VALUES (?, NULL, ?, 'down', CURRENT_TIMESTAMP)
                        `).bind(
                            newToolId,
                            `历史用户_${newToolId}_down_${k}`
                        ).run();
                        totalVotes++;
                    }

                    if (upvotes > 0 || downvotes > 0) {
                        console.log(`    迁移投票: ${upvotes} 👍, ${downvotes} 👎`);
                    }
                }
            }
        }

        console.log('数据迁移完成！');

        return new Response(JSON.stringify({
            success: true,
            message: '迁移成功',
            stats: {
                categories: kvData.categories.length,
                tools: totalTools,
                votes: totalVotes
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('迁移失败:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
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


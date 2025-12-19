// 数据迁移脚本：从 KV 迁移到 D1
// 使用方法：wrangler d1 execute DB_NAME --file=./db/migrate.js

export async function migrateFromKV(env) {
    console.log('开始从 KV 迁移数据到 D1...');

    try {
        // 1. 从 KV 读取数据
        const kvData = await env.GEEK_TOOLS_KV.get('data', { type: 'json' });

        if (!kvData || !kvData.categories) {
            console.log('KV 中没有数据，跳过迁移');
            return { success: true, message: '无数据需要迁移' };
        }

        console.log(`找到 ${kvData.categories.length} 个分类`);

        // 2. 迁移分类
        const categoryIdMap = {}; // 旧ID -> 新ID 映射

        for (let i = 0; i < kvData.categories.length; i++) {
            const category = kvData.categories[i];

            const result = await env.DB.prepare(`
                INSERT INTO categories (name, description, sort_order, created_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
                category.name,
                category.description || null,
                i
            ).run();

            const newCategoryId = result.meta.last_row_id;
            categoryIdMap[category.id] = newCategoryId;

            console.log(`迁移分类: ${category.name} (${category.id} -> ${newCategoryId})`);

            // 3. 迁移该分类下的工具
            if (category.tools && category.tools.length > 0) {
                for (let j = 0; j < category.tools.length; j++) {
                    const tool = category.tools[j];

                    const toolResult = await env.DB.prepare(`
                        INSERT INTO tools (
                            category_id, name, url, description,
                            sort_order, status, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `).bind(
                        newCategoryId,
                        tool.name,
                        tool.url,
                        tool.description || null,
                        j,
                        'active'
                    ).run();

                    const newToolId = toolResult.meta.last_row_id;

                    console.log(`  迁移工具: ${tool.name} (${tool.id} -> ${newToolId})`);

                    // 4. 迁移投票数据（创建虚拟投票记录）
                    const upvotes = tool.upvotes || 0;
                    const downvotes = tool.downvotes || 0;

                    // 为每个投票创建一条记录（使用虚拟用户标识）
                    for (let k = 0; k < upvotes; k++) {
                        await env.DB.prepare(`
                            INSERT INTO votes (
                                tool_id, user_id, user_name, vote_type, created_at
                            )
                            VALUES (?, NULL, ?, ?, CURRENT_TIMESTAMP)
                        `).bind(
                            newToolId,
                            `历史用户_${newToolId}_up_${k}`,
                            'up'
                        ).run();
                    }

                    for (let k = 0; k < downvotes; k++) {
                        await env.DB.prepare(`
                            INSERT INTO votes (
                                tool_id, user_id, user_name, vote_type, created_at
                            )
                            VALUES (?, NULL, ?, ?, CURRENT_TIMESTAMP)
                        `).bind(
                            newToolId,
                            `历史用户_${newToolId}_down_${k}`,
                            'down'
                        ).run();
                    }

                    if (upvotes > 0 || downvotes > 0) {
                        console.log(`    迁移投票: ${upvotes} 👍, ${downvotes} 👎`);
                    }
                }
            }
        }

        console.log('数据迁移完成！');

        return {
            success: true,
            message: '迁移成功',
            stats: {
                categories: kvData.categories.length,
                tools: kvData.categories.reduce((sum, cat) => sum + (cat.tools?.length || 0), 0)
            }
        };

    } catch (error) {
        console.error('迁移失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}


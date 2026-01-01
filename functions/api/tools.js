import { createResponse, createErrorResponse, handleRequest, corsHeaders } from '../_utils';

// API: 工具管理

// 创建工具
export async function onRequestPost(context) {
    return handleRequest(async () => {
        const { request, env } = context;
        const { category_id, name, url, description } = await request.json();

        if (!category_id || !name || !url) {
            return createErrorResponse('参数不完整', 400);
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

        return createResponse({
            success: true,
            id: result.meta.last_row_id
        });
    });
}

// 更新工具
export async function onRequestPut(context) {
    return handleRequest(async () => {
        const { request, env } = context;
        const { id, name, url, description } = await request.json();

        if (!id || !name || !url) {
            return createErrorResponse('参数不完整', 400);
        }

        await env.DB.prepare(`
            UPDATE tools
            SET name = ?, url = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(name, url, description || null, id).run();

        return createResponse({ success: true });
    });
}

// 删除工具
export async function onRequestDelete(context) {
    return handleRequest(async () => {
        const { request, env } = context;
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return createErrorResponse('缺少工具ID', 400);
        }

        await env.DB.prepare(`
            DELETE FROM tools WHERE id = ?
        `).bind(id).run();

        return createResponse({ success: true });
    });
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: corsHeaders
    });
}


import {createResponse, createErrorResponse, handleRequest, corsHeaders} from '../_utils';

// API: 工具提交

// 获取工具提交列表（管理员查看）
export async function onRequestGet(context) {
	return handleRequest(async () => {
		const {env} = context;
		const url = new URL(context.request.url);
		const limit = url.searchParams.get('limit') || 20;
		const offset = url.searchParams.get('offset') || 0;
		const status = url.searchParams.get('status');

		let query = `
            SELECT t.id,
                   t.category_id,
                   t.name,
                   t.url,
                   t.description,
                   t.sort_order,
                   t.status,
                   t.created_at,
                   t.updated_at,
                   c.name as category_name
            FROM tools t
            LEFT JOIN categories c ON t.category_id = c.id
        `;

		const params = [];
		
		if (status) {
			query += ` WHERE t.status = ?`;
			params.push(status);
		}

		query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
		params.push(limit, offset);

		const result = await env.DB.prepare(query).bind(...params).all();

		return createResponse({
			success: true,
			tools: result.results || []
		});
	});
}

// 提交新工具
export async function onRequestPost(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const {category_id, name, url, description, user_name, email, ip_address, user_agent} = await request.json();

		if (!category_id || !name || !url || !user_name || !email) {
			return createErrorResponse('所有必填字段不能为空', 400);
		}

		// URL格式验证
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			return createErrorResponse('URL必须以http://或https://开头', 400);
		}

		// 名称和描述长度限制
		const sanitizedName = name.trim().substring(0, 100);
		const sanitizedDescription = description ? description.trim().substring(0, 500) : null;
		const sanitizedUserName = user_name.trim().substring(0, 50);
		const sanitizedEmail = email.trim().substring(0, 100);

		// 获取该分类下当前最大排序值
		const maxSortResult = await env.DB.prepare(`
            SELECT COALESCE(MAX(sort_order), -1) as max_sort
            FROM tools
            WHERE category_id = ?
        `).bind(category_id).first();
		const sortOrder = (maxSortResult?.max_sort || 0) + 1;

		// 插入新工具（状态为pending，等待审核）
		const result = await env.DB.prepare(`
            INSERT INTO tools (
                category_id, 
                name, 
                url, 
                description, 
                sort_order,
                status,
                user_name,
                email,
                ip_address,
                user_agent
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        `).bind(
			category_id,
			sanitizedName,
			url,
			sanitizedDescription,
			sortOrder,
			sanitizedUserName,
			sanitizedEmail,
			ip_address || null,
			user_agent || null
		).run();

		return createResponse({
			success: true,
			id: result.meta.last_row_id
		});
	});
}

// 更新工具提交（管理员操作）
export async function onRequestPut(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const {id, name, url, description, status} = await request.json();

		if (!id) {
			return createErrorResponse('缺少工具ID', 400);
		}

		if (!name || !url) {
			return createErrorResponse('工具名称和URL不能为空', 400);
		}

		// URL格式验证
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			return createErrorResponse('URL必须以http://或https://开头', 400);
		}

		// 更新工具信息
		await env.DB.prepare(`
            UPDATE tools 
            SET name = ?, url = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).bind(
			name.trim().substring(0, 100),
			url,
			description ? description.trim().substring(0, 500) : null,
			status || 'active',
			id
		).run();

		return createResponse({success: true});
	});
}

// 删除工具提交（管理员操作）
export async function onRequestDelete(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const url = new URL(request.url);
		const id = url.searchParams.get('id');

		if (!id) {
			return createErrorResponse('缺少工具ID', 400);
		}

		// 删除工具
		await env.DB.prepare(`
            DELETE FROM tools WHERE id = ?
        `).bind(id).run();

		return createResponse({success: true});
	});
}

// 获取我的提交记录（用户查看）
export async function onRequestPatch(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const url = new URL(request.url);
		const user_name = url.searchParams.get('user_name');

		if (!user_name) {
			return createErrorResponse('缺少用户名', 400);
		}

		const result = await env.DB.prepare(`
            SELECT id, name, url, status, created_at, updated_at
            FROM tools
            WHERE user_name = ?
            ORDER BY created_at DESC
        `).bind(user_name).all();

		return createResponse({
			success: true,
			submissions: result.results || []
		});
	});
}

export async function onRequestOptions() {
	return new Response(null, {
		headers: corsHeaders
	});
}
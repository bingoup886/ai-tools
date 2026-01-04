import {createResponse, createErrorResponse, handleRequest, corsHeaders} from '../_utils';

// API: 获取所有分类和工具
export async function onRequestGet(context) {
	return handleRequest(async () => {
		const {env} = context;

		// 优化：一次性查询获取所有分类、工具、投票和标签数据
		// 使用子查询分别计算投票和标签，避免 JOIN 导致的数据重复
		const result = await env.DB.prepare(`
            SELECT c.id                      as category_id,
                   c.name                    as category_name,
                   c.description             as category_description,
                   c.sort_order              as category_sort_order,
                   c.created_at              as category_created_at,
                   c.updated_at              as category_updated_at,
                   t.id                      as tool_id,
                   t.name                    as tool_name,
                   t.url                     as tool_url,
                   t.description             as tool_description,
                   t.sort_order              as tool_sort_order,
                   t.status                  as tool_status,
                   t.created_at              as tool_created_at,
                   t.updated_at              as tool_updated_at,
                   COALESCE(tv.upvotes, 0)   as upvotes,
                   COALESCE(tv.downvotes, 0) as downvotes,
                   tg.id                     as tag_id,
                   tg.name                   as tag_name,
                   tg.slug                   as tag_slug,
                   tg.description            as tag_description,
                   tg.color                  as tag_color,
                   tg.icon                   as tag_icon,
                   tg.sort_order             as tag_sort_order
            FROM categories c
                     LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
                     LEFT JOIN (SELECT tool_id,
                                       SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END)   as upvotes,
                                       SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END) as downvotes
                                FROM votes
                                GROUP BY tool_id) tv ON t.id = tv.tool_id
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

		return createResponse({categories});
	});
}

// API: 创建分类
export async function onRequestPost(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const {name, description} = await request.json();

		if (!name) {
			return createErrorResponse('分类名称不能为空', 400);
		}

		// 获取当前最大排序值
		const maxSortResult = await env.DB.prepare(`
            SELECT COALESCE(MAX(sort_order), -1) as max_sort
            FROM categories
		`).first();

		const sortOrder = (maxSortResult?.max_sort || 0) + 1;

		// 插入新分类
		const result = await env.DB.prepare(`
            INSERT INTO categories (name, description, sort_order)
            VALUES (?, ?, ?)
		`).bind(name, description || null, sortOrder).run();

		return createResponse({
			success: true,
			id: result.meta.last_row_id
		});
	});
}

// API: 更新分类
export async function onRequestPut(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const {id, name, description} = await request.json();

		if (!id || !name) {
			return createErrorResponse('参数错误', 400);
		}

		await env.DB.prepare(`
            UPDATE categories
            SET name        = ?,
                description = ?,
                updated_at  = CURRENT_TIMESTAMP
            WHERE id = ?
		`).bind(name, description || null, id).run();

		return createResponse({success: true});
	});
}

// API: 删除分类
export async function onRequestDelete(context) {
	return handleRequest(async () => {
		const {request, env} = context;
		const url = new URL(request.url);
		const id = url.searchParams.get('id');

		if (!id) {
			return createErrorResponse('缺少分类ID', 400);
		}

		await env.DB.prepare(`
            DELETE
            FROM categories
            WHERE id = ?
		`).bind(id).run();

		return createResponse({success: true});
	});
}

export async function onRequestOptions() {
	return new Response(null, {
		headers: corsHeaders
	});
}


// API: 工具标签关联管理

// 获取工具的所有标签
export async function onRequestGet(context) {
	const {request, env} = context;
	const url = new URL(request.url);
	const toolId = url.searchParams.get('tool_id');

	if (!toolId) {
		return new Response(JSON.stringify({error: '工具ID不能为空'}), {
			status: 400,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}

	try {
		const {results} = await env.DB.prepare(`
            SELECT t.id, t.name, t.slug, t.description, t.color, t.icon
            FROM tags t
                     INNER JOIN tool_tags tt ON t.id = tt.tag_id
            WHERE tt.tool_id = ?
            ORDER BY t.sort_order ASC
		`).bind(toolId).all();

		return new Response(JSON.stringify(results || []), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('获取工具标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 为工具添加标签
export async function onRequestPost(context) {
	const {request, env} = context;

	try {
		const body = await request.json();
		const {tool_id, tag_ids = []} = body;

		if (!tool_id) {
			return new Response(JSON.stringify({error: '工具ID不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
			return new Response(JSON.stringify({error: '标签ID数组不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 先删除该工具的所有标签
		await env.DB.prepare(`
            DELETE
            FROM tool_tags
            WHERE tool_id = ?
		`).bind(tool_id).run();

		// 然后添加新的标签
		for (const tagId of tag_ids) {
			await env.DB.prepare(`
                INSERT INTO tool_tags (tool_id, tag_id)
                VALUES (?, ?)
			`).bind(tool_id, tagId).run();
		}

		return new Response(JSON.stringify({success: true}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('添加工具标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 删除工具的单个标签
export async function onRequestDelete(context) {
	const {request, env} = context;

	try {
		const body = await request.json();
		const {tool_id, tag_id} = body;

		if (!tool_id || !tag_id) {
			return new Response(JSON.stringify({error: '工具ID和标签ID不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		await env.DB.prepare(`
            DELETE
            FROM tool_tags
            WHERE tool_id = ?
              AND tag_id = ?
		`).bind(tool_id, tag_id).run();

		return new Response(JSON.stringify({success: true}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('删除工具标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
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
			'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		}
	});
}


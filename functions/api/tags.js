// API: 标签管理

// 获取所有标签
export async function onRequestGet(context) {
	const {env} = context;

	try {
		const {results} = await env.DB.prepare(`
            SELECT id,
                   name,
                   slug,
                   description,
                   color,
                   icon,
                   sort_order,
                   created_at
            FROM tags
            ORDER BY sort_order ASC, created_at DESC
		`).all();

		return new Response(JSON.stringify(results || []), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('获取标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 创建标签
export async function onRequestPost(context) {
	const {request, env} = context;

	try {
		const body = await request.json();
		const {name, slug, description, color = '#667eea', icon = ''} = body;

		if (!name || !slug) {
			return new Response(JSON.stringify({error: '名称和slug不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 检查 slug 是否已存在
		const {results: existing} = await env.DB.prepare(`
            SELECT id
            FROM tags
            WHERE slug = ?
		`).bind(slug).all();

		if (existing && existing.length > 0) {
			return new Response(JSON.stringify({error: 'slug已存在'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 获取最大的 sort_order
		const {results: maxSortResults} = await env.DB.prepare(`
            SELECT MAX(sort_order) as max_order
            FROM tags
		`).all();
		const nextSortOrder = (maxSortResults[0]?.max_order || 0) + 1;

		const result = await env.DB.prepare(`
            INSERT INTO tags (name, slug, description, color, icon, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
		`).bind(name, slug, description || '', color, icon, nextSortOrder).run();

		const tagId = result.meta.last_row_id;

		return new Response(JSON.stringify({
			id: tagId,
			name,
			slug,
			description: description || '',
			color,
			icon,
			sort_order: nextSortOrder
		}), {
			status: 201,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('创建标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 更新标签
export async function onRequestPut(context) {
	const {request, env} = context;

	try {
		const body = await request.json();
		const {id, name, slug, description, color, icon, sort_order} = body;

		if (!id) {
			return new Response(JSON.stringify({error: '标签ID不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 检查 slug 是否已被其他标签使用
		if (slug) {
			const {results: existing} = await env.DB.prepare(`
                SELECT id
                FROM tags
                WHERE slug = ?
                  AND id != ?
			`).bind(slug, id).all();

			if (existing && existing.length > 0) {
				return new Response(JSON.stringify({error: 'slug已被其他标签使用'}), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}
		}

		const updates = [];
		const values = [];

		if (name !== undefined) {
			updates.push('name = ?');
			values.push(name);
		}
		if (slug !== undefined) {
			updates.push('slug = ?');
			values.push(slug);
		}
		if (description !== undefined) {
			updates.push('description = ?');
			values.push(description);
		}
		if (color !== undefined) {
			updates.push('color = ?');
			values.push(color);
		}
		if (icon !== undefined) {
			updates.push('icon = ?');
			values.push(icon);
		}
		if (sort_order !== undefined) {
			updates.push('sort_order = ?');
			values.push(sort_order);
		}

		if (updates.length === 0) {
			return new Response(JSON.stringify({error: '没有要更新的字段'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		values.push(id);

		await env.DB.prepare(`
            UPDATE tags
            SET ${updates.join(', ')}
            WHERE id = ?
		`).bind(...values).run();

		return new Response(JSON.stringify({success: true}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('更新标签失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 删除标签
export async function onRequestDelete(context) {
	const {request, env} = context;

	try {
		const body = await request.json();
		const {id} = body;

		if (!id) {
			return new Response(JSON.stringify({error: '标签ID不能为空'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 删除标签会自动删除关联的 tool_tags（因为有 CASCADE 约束）
		await env.DB.prepare(`
            DELETE
            FROM tags
            WHERE id = ?
		`).bind(id).run();

		return new Response(JSON.stringify({success: true}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('删除标签失败:', error);
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
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		}
	});
}


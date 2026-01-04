// API: 投票管理

// 投票
export async function onRequestPost(context) {
	const {request, env} = context;

	try {
		const {tool_id, vote_type, user_id, user_name} = await request.json();

		if (!tool_id || !vote_type || !['up', 'down'].includes(vote_type)) {
			return new Response(JSON.stringify({error: '参数错误'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		// 获取 IP 地址
		const ip = request.headers.get('CF-Connecting-IP') ||
			request.headers.get('X-Forwarded-For') ||
			'unknown';

		const userAgent = request.headers.get('User-Agent') || '';

		// 使用 user_id（如果已登录）或 user_name（匿名用户标识）
		const finalUserId = user_id || null;
		const finalUserName = user_name || `匿名_${ip.replace(/\./g, '_')}`;

		// 检查是否已投票
		const existingVote = await env.DB.prepare(`
            SELECT id, vote_type
            FROM votes
            WHERE tool_id = ?
              AND (
                (user_id IS NOT NULL AND user_id = ?) OR
                (user_id IS NULL AND user_name = ?)
                )
		`).bind(tool_id, finalUserId, finalUserName).first();

		if (existingVote) {
			if (existingVote.vote_type === vote_type) {
				// 取消投票
				await env.DB.prepare(`
                    DELETE
                    FROM votes
                    WHERE id = ?
				`).bind(existingVote.id).run();
			} else {
				// 更改投票
				await env.DB.prepare(`
                    UPDATE votes
                    SET vote_type  = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
				`).bind(vote_type, existingVote.id).run();
			}
		} else {
			// 新增投票
			await env.DB.prepare(`
                INSERT INTO votes (tool_id, user_id, user_name, vote_type, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
			`).bind(tool_id, finalUserId, finalUserName, vote_type, ip, userAgent).run();
		}

		// 获取更新后的投票统计
		const voteCounts = await env.DB.prepare(`
            SELECT COALESCE(SUM(CASE WHEN vote_type = 'up' THEN 1 ELSE 0 END), 0)   as upvotes,
                   COALESCE(SUM(CASE WHEN vote_type = 'down' THEN 1 ELSE 0 END), 0) as downvotes
            FROM votes
            WHERE tool_id = ?
		`).bind(tool_id).first();

		return new Response(JSON.stringify({
			success: true,
			upvotes: voteCounts.upvotes,
			downvotes: voteCounts.downvotes
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});

	} catch (error) {
		console.error('投票失败:', error);
		return new Response(JSON.stringify({error: error.message}), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	}
}

// 获取用户投票状态
export async function onRequestGet(context) {
	const {request, env} = context;

	try {
		const url = new URL(request.url);
		const tool_id = url.searchParams.get('tool_id');
		const user_id = url.searchParams.get('user_id');
		const user_name = url.searchParams.get('user_name');

		if (!tool_id) {
			return new Response(JSON.stringify({error: '缺少工具ID'}), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				}
			});
		}

		const vote = await env.DB.prepare(`
            SELECT vote_type
            FROM votes
            WHERE tool_id = ?
              AND (
                (user_id IS NOT NULL AND user_id = ?) OR
                (user_id IS NULL AND user_name = ?)
                )
		`).bind(tool_id, user_id || null, user_name || '').first();

		return new Response(JSON.stringify({
			vote_type: vote?.vote_type || null
		}), {
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});

	} catch (error) {
		console.error('获取投票状态失败:', error);
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
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		}
	});
}


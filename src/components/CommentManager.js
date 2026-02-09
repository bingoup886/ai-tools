import React, { useState, useEffect } from 'react';

const CommentManager = ({ isAdmin = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'delete'

  useEffect(() => {
    if (isAdmin) {
      fetchComments();
    }
  }, [isAdmin]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/comments');
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      } else {
        setError(data.message || '获取评论列表失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (commentId, actionType) => {
    try {
      const response = await fetch('/api/comments', {
        method: actionType === 'delete' ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: commentId,
          user_name: 'admin', // 管理员操作
          status: actionType === 'approve' ? 'approved' : 'deleted'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchComments(); // 重新获取列表
        setSelectedComment(null);
        setAction(null);
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error performing action:', err);
    }
  };

  if (loading) {
    return <div className="comment-manager">加载中...</div>;
  }

  if (error) {
    return <div className="comment-manager error">{error}</div>;
  }

  if (!isAdmin) {
    return (
      <div className="comment-manager">
        <div className="admin-warning">
          <strong>警告:</strong> 此功能仅限管理员使用。
        </div>
      </div>
    );
  }

  return (
    <div className="comment-manager">
      <h3>评论管理</h3>
      
      {comments.length === 0 ? (
        <div className="no-comments">
          暂无评论
        </div>
      ) : (
        <div className="comments-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>内容</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="comment-row">
                  <td>{comment.id}</td>
                  <td>
                    <div className="comment-user">
                      {comment.user_name}
                    </div>
                    <div className="comment-time">
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div className="comment-content">
                      {comment.content}
                    </div>
                    {comment.parent_id && (
                      <div className="comment-reply-to">
                        回复 #{comment.parent_id}
                      </div>
                    )}
                    {comment.children && (
                      <div className="comment-children">
                        <small>{comment.children.length} 条回复</small>
                      </div>
                    )}
                  </td>
                  <td>
                    {comment.status === 'pending' ? (
                      <span className="status-pending">待审核</span>
                    ) : comment.status === 'approved' ? (
                      <span className="status-active">已通过</span>
                    ) : (
                      <span className="status-rejected">已删除</span>
                    )}
                  </td>
                  <td>
                    {comment.status === 'pending' && (
                      <div className="comment-actions">
                        <button
                          onClick={() => handleAction(comment.id, 'approve')}
                          className="btn btn-success">
                          通过
                        </button>
                        <button
                          onClick={() => handleAction(comment.id, 'delete')}
                          className="btn btn-danger">
                          删除
                        </button>
                      </div>
                    )}
                    {comment.status === 'approved' && (
                      <button
                        onClick={() => handleAction(comment.id, 'delete')}
                        className="btn btn-danger">
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CommentManager;
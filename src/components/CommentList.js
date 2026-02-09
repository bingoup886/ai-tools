import React, { useState, useEffect } from 'react';

const CommentList = ({ parentId = null, limit = 10, offset = 0 }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [parentId, limit, offset]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (parentId !== null) {
        params.append('parent_id', parentId);
      }
      params.append('limit', limit);
      params.append('offset', offset);

      const response = await fetch(`/api/comments?${params}`);
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments || []);
      } else {
        setError(data.message || '获取评论失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="comment-list">加载中...</div>;
  }

  if (error) {
    return <div className="comment-list error">{error}</div>;
  }

  return (
    <div className="comment-list">
      {comments.length === 0 ? (
        <div className="no-comments">暂无评论</div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <span className="comment-author">{comment.user_name}</span>
              <span className="comment-time">
                {new Date(comment.created_at).toLocaleString()}
              </span>
              <span className="comment-likes">
                {comment.likes} 个赞
              </span>
            </div>
            <div className="comment-content">{comment.content}</div>
            {comment.parent_id && (
              <div className="comment-reply-to">
                回复 #{comment.parent_id}
              </div>
            )}
            {comment.children && (
              <div className="comment-children">
                <CommentList 
                  parentId={comment.id} 
                  limit={5} 
                  offset={0}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CommentList;
import React, { useState } from 'react';

const CommentForm = ({ parentId = null, onSubmit }) => {
  const [userName, setUserName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim() || !content.trim()) {
      setError('用户名和内容不能为空');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = {
        user_name: userName.trim(),
        content: content.trim(),
        parent_id: parentId || null,
        ip_address: 'client-ip', // 需要从请求中获取
        user_agent: navigator.userAgent
      };

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        if (onSubmit) {
          onSubmit(data.id);
        }
        // 重置表单
        setUserName('');
        setContent('');
      } else {
        setError(data.message || '发布评论失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error posting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          user_name: userName,
          ip_address: 'client-ip',
          user_agent: navigator.userAgent
        })
      });

      const data = await response.json();
      return response.ok;
    } catch (err) {
      console.error('Error liking comment:', err);
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      {parentId && (
        <div className="reply-to">
          回复评论 #{parentId}
        </div>
      )}
      
      <div className="form-group">
        <label>用户名:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="请输入用户名"
          required
        />
      </div>

      <div className="form-group">
        <label>内容:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入评论内容"
          required
        />
      </div>

      {error && (
        <div className="form-error">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? '发布中...' : (parentId ? '回复' : '发布评论')}
      </button>
    </form>
  );
};

export default CommentForm;
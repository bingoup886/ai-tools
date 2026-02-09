import React, { useState, useEffect } from 'react';

const ToolSubmissionList = ({ userId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [userId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tool-submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_name: userId })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.message || '获取提交记录失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tool-submission-list">加载中...</div>;
  }

  if (error) {
    return <div className="tool-submission-list error">{error}</div>;
  }

  return (
    <div className="tool-submission-list">
      <h3>我的工具提交</h3>
      
      {submissions.length === 0 ? (
        <div className="no-submissions">
          暂无提交记录
        </div>
      ) : (
        <ul className="submissions-list">
          {submissions.map((submission) => (
            <li key={submission.id} className="submission-item">
              <div className="submission-header">
                <span className="submission-name">
                  <strong>{submission.name}</strong>
                </span>
                <span className="submission-status">
                  {submission.status === 'pending' ? (
                    <span className="status-pending">待审核</span>
                  ) : submission.status === 'active' ? (
                    <span className="status-active">已通过</span>
                  ) : (
                    <span className="status-rejected">未通过</span>
                  )}
                </span>
              </div>
              
              <div className="submission-url">
                <a href={submission.url} target="_blank" rel="noopener noreferrer">
                  {submission.url}
                </a>
              </div>
              
              {submission.description && (
                <div className="submission-description">
                  {submission.description}
                </div>
              )}
              
              <div className="submission-meta">
                <span className="submission-date">
                  {new Date(submission.created_at).toLocaleDateString()}
                </span>
                <span className="submission-id">
                  ID: {submission.id}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ToolSubmissionList;
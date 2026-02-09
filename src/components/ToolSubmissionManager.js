import React, { useState, useEffect } from 'react'';

const ToolSubmissionManager = ({ isAdmin = false }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject'

  useEffect(() => {
    if (isAdmin) {
      fetchSubmissions();
    }
  }, [isAdmin]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/tool-submissions');
      const data = await response.json();

      if (response.ok) {
        setSubmissions(data.tools || []);
      } else {
        setError(data.message || '获取提交列表失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (submissionId, actionType) => {
    try {
      const response = await fetch('/api/tool-submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: submissionId,
          status: actionType === 'approve' ? 'active' : 'rejected'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        fetchSubmissions(); // 重新获取列表
        setSelectedSubmission(null);
        setAction(null);
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error performing action:', err);
    }
  };

  const handleDelete = async (submissionId) => {
    try {
      const response = await fetch('/api/tool-submissions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: submissionId })
      });

      if (response.ok) {
        fetchSubmissions(); // 重新获取列表
      } else {
        const data = await response.json();
        setError(data.message || '删除失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error deleting submission:', err);
    }
  };

  if (loading) {
    return <div className="tool-submission-manager">加载中...</div>;
  }

  if (error) {
    return <div className="tool-submission-manager error">{error}</div>;
  }

  if (!isAdmin) {
    return (
      <div className="tool-submission-manager">
        <div className="admin-warning">
          <strong>警告:</strong> 此功能仅限管理员使用。
        </div>
      </div>
    );
  }

  return (
    <div className="tool-submission-manager">
      <h3>工具提交管理</h3>
      
      {submissions.length === 0 ? (
        <div className="no-submissions">
          暂无工具提交
        </div>
      ) : (
        <div className="submissions-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>工具名称</th>
                <th>提交者</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="submission-row">
                  <td>{submission.id}</td>
                  <td>
                    <div className="submission-name">
                      <strong>{submission.name}</strong>
                    </div>
                    <div className="submission-url">
                      <a href={submission.url} target="_blank" rel="noopener noreferrer">
                        {submission.url}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="submission-user">
                      {submission.user_name}
                    </div>
                    <div className="submission-email">
                      {submission.email}
                    </div>
                  </td>
                  <td>
                    {submission.status === 'pending' ? (
                      <span className="status-pending">待审核</span>
                    ) : submission.status === 'active' ? (
                      <span className="status-active">已通过</span>
                    ) : (
                      <span className="status-rejected">未通过</span>
                    )}
                  </td>
                  <td>
                    {submission.status === 'pending' && (
                      <div className="submission-actions">
                        <button
                          onClick={() => handleAction(submission.id, 'approve')}
                          className="btn btn-success">
                          通过
                        </button>
                        <button
                          onClick={() => handleAction(submission.id, 'reject')}
                          className="btn btn-danger">
                          拒绝
                        </button>
                      </div>
                    )}
                    <div className="submission-meta">
                      <span className="submission-date">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(submission.id)}
                        className="btn btn-sm btn-warning">
                        删除
                      </button>
                    </div>
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

export default ToolSubmissionManager;
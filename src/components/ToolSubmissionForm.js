import React, { useState } from 'react';

const ToolSubmissionForm = ({ onSubmit, userId }) => {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!categoryId || !name || !url || !userName || !email) {
      setError('所有必填字段不能为空');
      return;
    }

    // URL格式验证
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL必须以http://或https://开头');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const formData = {
        category_id: categoryId,
        name: name.trim(),
        url: url.trim(),
        description: description.trim() || null,
        user_name: userName.trim(),
        email: email.trim(),
        ip_address: 'client-ip', // 需要从请求中获取
        user_agent: navigator.userAgent
      };

      const response = await fetch('/api/tool-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        if (onSubmit) {
          onSubmit(data.id);
        }
        // 重置表单
        setCategoryId('');
        setName('');
        setUrl('');
        setDescription('');
        setUserName('');
        setEmail('');
      } else {
        setError(data.message || '提交工具失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('Error submitting tool:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '1', name: '编程工具' },
    { id: '2', name: '设计工具' },
    { id: '3', name: '生产力工具' },
    { id: '4', name: '开发工具' },
    { id: '5', name: '其他工具' }
  ];

  return (
    <form onSubmit={handleSubmit} className="tool-submission-form">
      <h3>提交新工具</h3>
      
      <div className="form-group">
        <label>分类:</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">请选择分类</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>工具名称:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入工具名称"
          maxLength={100}
          required
        />
      </div>

      <div className="form-group">
        <label>工具URL:</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="请输入工具URL"
          required
        />
      </div>

      <div className="form-group">
        <label>描述:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请输入工具描述（可选）"
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label>您的姓名:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="请输入您的姓名"
          maxLength={50}
          required
        />
      </div>

      <div className="form-group">
        <label>您的邮箱:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="请输入您的邮箱"
          maxLength={100}
          required
        />
      </div>

      {error && (
        <div className="form-error">{error}</div>
      )}

      {success && (
        <div className="form-success">
          工具提交成功！请等待管理员审核。
        </div>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? '提交中...' : '提交工具'}
      </button>
    </form>
  );
};

export default ToolSubmissionForm;
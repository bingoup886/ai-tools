import React, { useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import ToolSubmissionForm from './ToolSubmissionForm';
import ToolSubmissionList from './ToolSubmissionList';
import ToolSubmissionManager from './ToolSubmissionManager';
import CommentManager from './CommentManager';

const CommentsSection = ({ userId }) => {
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const handleReply = (commentId) => {
    setSelectedCommentId(commentId);
  };

  const handleCommentPosted = () => {
    setSelectedCommentId(null);
  };

  return (
    <div className="comments-section">
      <h2>网站评论</h2>
      
      <div className="comments-container">
        <CommentList 
          parentId={null} 
          limit={10} 
          offset={0}
        />
      </div>
      
      <div className="comment-form-container">
        <CommentForm
          parentId={selectedCommentId}
          onSubmit={handleCommentPosted}
        />
      </div>
    </div>
  );
};

const ToolSubmissionsSection = ({ userId, isAdmin = false }) => {
  return (
    <div className="tool-submissions-section">
      <h2>工具提交</h2>
      
      <div className="submission-form-container">
        <ToolSubmissionForm 
          userId={userId}
        />
      </div>
      
      <div className="submission-list-container">
        <ToolSubmissionList 
          userId={userId}
        />
      </div>
      
      {isAdmin && (
        <div className="submission-manager-container">
          <ToolSubmissionManager 
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
};

const AdminSection = ({ isAdmin = false }) => {
  return (
    <div className="admin-section">
      <h2>管理面板</h2>
      
      <div className="admin-container">
        <CommentManager 
          isAdmin={isAdmin}
        />
        <ToolSubmissionManager 
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

const CommunitySection = ({ userId, isAdmin = false }) => {
  return (
    <div className="community-section">
      <h1>社区互动</h1>
      
      <div className="community-content">
        <CommentsSection 
          userId={userId}
        />
        <ToolSubmissionsSection 
          userId={userId}
          isAdmin={isAdmin}
        />
        {isAdmin && (
          <AdminSection 
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
};

export { CommentsSection, ToolSubmissionsSection, AdminSection, CommunitySection };
export const Header = ({ isEditMode, onToggleMode, onOpenSortModal, onLogoClick, showAdminHint }) => {
  return (
    <div className="header">
      <h1
        className="logo-clickable"
        onClick={onLogoClick}
        title="点击Logo进入管理员模式"
      >
        🚀 Geek工具导航站
      </h1>
      {showAdminHint && (
        <div className="admin-hint">
          ✨ 管理员模式已激活！
        </div>
      )}
      <div className="header-actions">
        {isEditMode && (
          <>
            <span className={`mode-badge ${isEditMode ? 'edit' : 'view'}`}>
              {isEditMode ? '维护模式' : '展示模式'}
            </span>
            <button
              className="btn btn-primary"
              onClick={onOpenSortModal}
              title="排序分类"
            >
              📋 排序分类
            </button>
            <button
              className={`btn ${isEditMode ? 'btn-success' : 'btn-primary'}`}
              onClick={onToggleMode}
            >
              {isEditMode ? '展示模式' : '维护模式'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}


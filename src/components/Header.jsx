export const Header = ({ isEditMode, onToggleMode, onOpenSortModal }) => {
  return (
    <div className="header">
      <h1>🚀 Geek工具导航站</h1>
      <div className="header-actions">
        <span className={`mode-badge ${isEditMode ? 'edit' : 'view'}`}>
          {isEditMode ? '维护模式' : '展示模式'}
        </span>
        {isEditMode && (
          <button
            className="btn btn-primary"
            onClick={onOpenSortModal}
            title="排序方向"
          >
            📋 排序方向
          </button>
        )}
        <button
          className={`btn ${isEditMode ? 'btn-success' : 'btn-primary'}`}
          onClick={onToggleMode}
        >
          {isEditMode ? '展示模式' : '维护模式'}
        </button>
      </div>
    </div>
  )
}


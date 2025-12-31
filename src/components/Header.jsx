export const Header = ({ isEditMode, onToggleMode }) => {
  return (
    <div className="header">
      <h1>🚀 Geek工具导航站</h1>
      <div className="header-actions">
        <span className={`mode-badge ${isEditMode ? 'edit' : 'view'}`}>
          {isEditMode ? '维护模式' : '展示模式'}
        </span>
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


export const Header = ({isEditMode, onToggleMode, onOpenSortModal}) => {
	return (
		<div className="header">
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


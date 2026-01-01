export const TagBadge = ({ tag, onRemove, isRemovable = false }) => {
  return (
    <div
      className="tag-badge"
      style={{
        backgroundColor: tag.color || '#667eea',
        color: '#fff',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        whiteSpace: 'nowrap'
      }}
      title={tag.description}
    >
      {tag.icon && <span>{tag.icon}</span>}
      <span>{tag.name}</span>
      {isRemovable && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove && onRemove(tag.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '2px',
            fontSize: '14px',
            lineHeight: '1'
          }}
          title="移除标签"
        >
          ×
        </button>
      )}
    </div>
  )
}


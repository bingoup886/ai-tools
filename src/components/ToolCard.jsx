import { useVote } from '../hooks/useVote'

export const ToolCard = ({
  tool,
  rank,
  isEditMode,
  onEdit,
  onDelete,
  onVote,
  draggableProps
}) => {
  const { getUserVote, setUserVote, removeUserVote } = useVote()
  const currentVote = getUserVote(tool.id)

  const handleVote = (type) => {
    const userCurrentVote = getUserVote(tool.id)

    if (userCurrentVote === type) {
      // 取消投票
      removeUserVote(tool.id)
    } else {
      // 投票
      setUserVote(tool.id, type)
    }

    onVote(tool.id, type)
  }

  return (
    <div className={`tool-card-wrapper ${isEditMode ? 'draggable' : ''}`} {...draggableProps}>
      {tool.description && (
        <div className="tool-description">{tool.description}</div>
      )}
      <div className="tool-card">
        <div className="tool-rank">{rank}</div>
        <div className="tool-name">
          <a href={tool.url} target="_blank" rel="noopener noreferrer" title={tool.url}>
            {tool.name}
          </a>
        </div>
        {isEditMode && (
          <>
            <button
              className="delete-btn"
              onClick={onDelete}
              style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 3 }}
            >
              ×
            </button>
            <button
              className="edit-tool-btn"
              onClick={onEdit}
              title="编辑工具"
            >
              ✏️
            </button>
          </>
        )}
      </div>
      <div className="vote-buttons">
        <button
          className={`vote-btn upvote ${currentVote === 'up' ? 'active' : ''}`}
          onClick={() => handleVote('up')}
          title="点赞"
        >
          👍 {tool.upvotes || 0}
        </button>
        <button
          className={`vote-btn downvote ${currentVote === 'down' ? 'active' : ''}`}
          onClick={() => handleVote('down')}
          title="点踩"
        >
          👎 {tool.downvotes || 0}
        </button>
      </div>
    </div>
  )
}


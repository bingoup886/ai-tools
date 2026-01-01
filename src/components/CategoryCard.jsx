import { useState, useRef, useEffect } from 'react'
import { ToolCard } from './ToolCard'
import { TagTabs } from './TagTabs'
import { useData } from '../hooks/useData'
import Sortable from 'sortablejs'

export const CategoryCard = ({
  category,
  isEditMode,
  onEdit,
  onDelete,
  onAddTool,
  onEditTool,
  onDeleteTool,
  onVote,
  onUpdateCategoryName,
  onSortTools
}) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState(category.name)
  const [selectedTagId, setSelectedTagId] = useState(null)
  const inputRef = useRef(null)
  const gridRef = useRef(null)
  const sortableRef = useRef(null)

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

  // Initialize Sortable for tools
  useEffect(() => {
    if (isEditMode && gridRef.current && !sortableRef.current) {
      sortableRef.current = new Sortable(gridRef.current, {
        animation: 200,
        ghostClass: 'dragging',
        chosenClass: 'drag-over',
        dragClass: 'dragging',
        forceFallback: true,
        fallbackTolerance: 3,
        onEnd: async (evt) => {
          if (evt.oldIndex !== evt.newIndex) {
            const sortedTools = Array.from(gridRef.current.children)
              .map(el => el.getAttribute('data-tool-id'))
            onSortTools(category.id, sortedTools)
          }
        }
      })
    }

    return () => {
      if (sortableRef.current && !isEditMode) {
        sortableRef.current.destroy()
        sortableRef.current = null
      }
    }
  }, [isEditMode, category.id, onSortTools])

  const handleNameEdit = async () => {
    if (editingName.trim() && editingName !== category.name) {
      await onUpdateCategoryName(category.id, editingName.trim())
    }
    setIsEditingName(false)
    setEditingName(category.name)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameEdit()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditingName(category.name)
    }
  }

  // 先排序，再过滤
  let sortedTools = [...(category.tools || [])].sort((a, b) => {
    const scoreA = (a.upvotes || 0) - (a.downvotes || 0)
    const scoreB = (b.upvotes || 0) - (b.downvotes || 0)
    return scoreB - scoreA
  })

  // 根据选中的标签进行过滤
  if (selectedTagId) {
    sortedTools = sortedTools.filter(tool => {
      return tool.tags && tool.tags.some(tag => tag.id === selectedTagId)
    })
  }

  return (
    <div className={`category-section ${isEditMode ? 'draggable' : ''}`} data-category-id={category.id}>
      <div className="category-header">
        <div className="category-title">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              className="category-name-input"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleNameEdit}
            />
          ) : (
            <>
              <span
                className={`category-name ${isEditMode ? 'editable' : ''}`}
                onClick={() => isEditMode && setIsEditingName(true)}
              >
                {category.name}
              </span>
              {isEditMode && <span className="edit-icon">✏️</span>}
            </>
          )}
        </div>
        <div className="category-actions">
          {isEditMode && (
            <>
              <button className="btn btn-primary btn-small" onClick={() => onAddTool(category.id)}>
                ➕ 添加工具
              </button>
              <button className="delete-btn" onClick={() => onDelete(category.id)}>
                删除分类
              </button>
            </>
          )}
        </div>
      </div>

      {/* 标签 Tabs */}
      <TagTabs
        category={category}
        onTagFilterChange={setSelectedTagId}
      />

      <div className="tools-grid" ref={gridRef} data-category-id={category.id}>
        {sortedTools.length === 0 ? (
          <div className="empty-state">暂无工具</div>
        ) : (
          sortedTools.map((tool, index) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              rank={index + 1}
              isEditMode={isEditMode}
              onEdit={() => onEditTool(category.id, tool)}
              onDelete={() => onDeleteTool(tool.id)}
              onVote={onVote}
              draggableProps={{ 'data-tool-id': tool.id }}
            />
          ))
        )}
      </div>
    </div>
  )
}


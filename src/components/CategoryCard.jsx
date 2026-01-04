import { useEffect, useRef, useState, useMemo } from 'react'
import { ToolCard } from './ToolCard'
import { useSortable } from '../hooks/useSortable'

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

  // 使用自定义 Hook 处理拖拽
  useSortable({
    containerRef: gridRef,
    enabled: isEditMode,
    onSort: (sortedIds) => onSortTools(category.id, sortedIds),
    idAttribute: 'data-tool-id'
  })

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingName])

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

  // 提取该分类下所有标签
  const uniqueTags = useMemo(() => {
    const allTags = new Map()
    const tools = category.tools || []
    tools.forEach(tool => {
      if (tool.tags && Array.isArray(tool.tags)) {
        tool.tags.forEach(tag => {
          if (!allTags.has(tag.id)) {
            allTags.set(tag.id, tag)
          }
        })
      }
    })
    return Array.from(allTags.values())
  }, [category.tools])

  // 仅过滤，不重新排序（保持后端返回的手动排序顺序）
  const sortedTools = useMemo(() => {
    let tools = [...(category.tools || [])]

    if (selectedTagId) {
      tools = tools.filter(tool => {
        return tool.tags && tool.tags.some(tag => tag.id === selectedTagId)
      })
    }
    return tools
  }, [category.tools, selectedTagId])

  return (
    <div className={`category-section ${isEditMode ? 'draggable' : ''}`} data-category-id={category.id}>
      {/* Category 标题和标签栏 */}
      <div className="category-header">
        <div className="category-header-left">
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
                  style={{ cursor: isEditMode ? 'pointer' : 'default' }}
                >
                  {category.name}
                </span>
                {isEditMode && <span className="edit-icon">✏️</span>}
              </>
            )}
          </div>

          {/* 标签展示 */}
          {uniqueTags.length > 0 && (
            <div className="category-tags-wrapper">
              {/* "所有" 虚拟标签 */}
              <div
                className={`category-tag ${selectedTagId === null ? 'active' : ''}`}
                onClick={() => setSelectedTagId(null)}
                style={{
                    backgroundColor: selectedTagId === null ? '#667eea' : '#f5f5f5',
                    color: selectedTagId === null ? '#fff' : '#667eea'
                }}
              >
                <span>所有</span>
              </div>

              {uniqueTags.map(tag => (
                <div
                  key={tag.id}
                  className={`category-tag ${selectedTagId === tag.id ? 'active' : ''}`}
                  onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
                  style={{
                    backgroundColor: selectedTagId === tag.id ? tag.color || '#667eea' : '#f5f5f5',
                    color: selectedTagId === tag.id ? '#fff' : tag.color || '#667eea'
                  }}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  <span>{tag.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
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


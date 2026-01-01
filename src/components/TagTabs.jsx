import { useState } from 'react'

export const TagTabs = ({ category, onTagFilterChange }) => {
  const [selectedTagId, setSelectedTagId] = useState(null)

  // 从分类下的所有工具中提取所有标签
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

  const uniqueTags = Array.from(allTags.values())

  const handleTagSelect = (tagId) => {
    const newSelectedTagId = selectedTagId === tagId ? null : tagId
    setSelectedTagId(newSelectedTagId)
    onTagFilterChange(newSelectedTagId)
  }

  // 如果没有标签，不显示 Tab
  if (uniqueTags.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0',
        overflowX: 'auto',
        flexWrap: 'wrap'
      }}
    >
      {/* "所有" Tab */}
      <button
        onClick={() => handleTagSelect(null)}
        style={{
          padding: '6px 14px',
          border: selectedTagId === null ? '2px solid #667eea' : '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: selectedTagId === null ? '#f0f7ff' : '#fff',
          color: selectedTagId === null ? '#667eea' : '#666',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: selectedTagId === null ? '600' : '500',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          if (selectedTagId !== null) {
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.backgroundColor = '#f9f9f9'
          }
        }}
        onMouseLeave={(e) => {
          if (selectedTagId !== null) {
            e.currentTarget.style.borderColor = '#ddd'
            e.currentTarget.style.backgroundColor = '#fff'
          }
        }}
      >
        所有
      </button>

      {/* 标签 Tabs */}
      {uniqueTags.map(tag => (
        <button
          key={tag.id}
          onClick={() => handleTagSelect(tag.id)}
          style={{
            padding: '6px 14px',
            border: selectedTagId === tag.id ? '2px solid #667eea' : '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: selectedTagId === tag.id ? '#f0f7ff' : '#fff',
            color: selectedTagId === tag.id ? '#667eea' : '#666',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: selectedTagId === tag.id ? '600' : '500',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            if (selectedTagId !== tag.id) {
              e.currentTarget.style.borderColor = '#667eea'
              e.currentTarget.style.backgroundColor = '#f9f9f9'
            }
          }}
          onMouseLeave={(e) => {
            if (selectedTagId !== tag.id) {
              e.currentTarget.style.borderColor = '#ddd'
              e.currentTarget.style.backgroundColor = '#fff'
            }
          }}
        >
          {tag.icon && <span>{tag.icon}</span>}
          <span
            style={{
              color: tag.color || '#667eea',
              fontWeight: '500'
            }}
          >
            {tag.name}
          </span>
        </button>
      ))}
    </div>
  )
}


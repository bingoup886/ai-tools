import { useState, useEffect, useRef } from 'react'

export const TagSelector = ({ availableTags = [], selectedTagIds = [], onChange, onCreateTag }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id))

  // 获取未被选中的标签
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id))

  // 根据搜索文本过滤标签
  const filteredTags = unselectedTags.filter(tag =>
    tag.name.toLowerCase().includes(searchText.toLowerCase().trim())
  )

  // 检查搜索文本是否已存在
  const searchTrimmed = searchText.trim()
  const isExistingTag = availableTags.some(tag =>
    tag.name.toLowerCase() === searchTrimmed.toLowerCase()
  )
  const canCreateNewTag = searchTrimmed.length > 0 && !isExistingTag

  const handleTagSelect = (tagId) => {
    const newTagIds = [...selectedTagIds, tagId]
    onChange(newTagIds)
    setSearchText('')
  }

  const handleTagRemove = (tagId) => {
    const newTagIds = selectedTagIds.filter(id => id !== tagId)
    onChange(newTagIds)
  }

  const handleCreateTag = async () => {
    if (!canCreateNewTag || isCreating) return

    setIsCreating(true)
    try {
      // 生成 slug（将中文或空格转换为下划线）
      const slug = searchTrimmed.toLowerCase().replace(/\s+/g, '_')

      if (onCreateTag) {
        const newTag = await onCreateTag({
          name: searchTrimmed,
          slug: slug,
          description: '',
          color: '#667eea'
        })

        if (newTag && newTag.id) {
          // 新建标签后直接选中
          const newTagIds = [...selectedTagIds, newTag.id]
          onChange(newTagIds)
          setSearchText('')
        }
      }
    } catch (err) {
      console.error('创建标签失败:', err)
      alert('创建标签失败')
    } finally {
      setIsCreating(false)
    }
  }

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 当搜索框打开时自动 focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  return (
    <div className="tag-selector" style={{ marginTop: '10px' }} ref={containerRef}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        标签：
      </label>

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedTags.map(tag => (
            <div
              key={tag.id}
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
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleTagRemove(tag.id)
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
            </div>
          ))}
        </div>
      )}

      {/* 标签选择输入框 */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="输入标签名称，支持模糊搜索或新增"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && canCreateNewTag) {
              e.preventDefault()
              handleCreateTag()
            }
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: isOpen ? '1px solid #667eea' : '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
            transition: 'border-color 0.2s'
          }}
        />

        {/* 下拉菜单 */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              marginTop: '-1px',
              zIndex: '100',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {/* 创建新标签选项 */}
            {canCreateNewTag && (
              <div
                onClick={handleCreateTag}
                style={{
                  padding: '10px 12px',
                  cursor: isCreating ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f0f7ff',
                  borderBottom: '1px solid #e6f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isCreating ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isCreating) e.currentTarget.style.backgroundColor = '#e6f0ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f7ff'
                }}
              >
                <span style={{ fontSize: '14px' }}>➕</span>
                <span style={{ fontSize: '13px', color: '#667eea', fontWeight: '500' }}>
                  {isCreating ? '创建中...' : `创建新标签: "${searchTrimmed}"`}
                </span>
              </div>
            )}

            {/* 已有标签列表 */}
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <div
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.id)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div
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
                  </div>
                </div>
              ))
            ) : !canCreateNewTag && searchTrimmed.length > 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                没有匹配的标签
              </div>
            ) : null}

            {/* 如果没有搜索文本且没有过滤结果，显示提示 */}
            {!searchTrimmed && filteredTags.length === 0 && availableTags.length > 0 && (
              <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                输入标签名称进行搜索
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


import { useState, useEffect } from 'react'
import { TagBadge } from './TagBadge'

export const TagSelector = ({ availableTags = [], selectedTagIds = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id))
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id))

  const filteredTags = unselectedTags.filter(tag =>
    tag.name.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleTagSelect = (tagId) => {
    const newTagIds = [...selectedTagIds, tagId]
    onChange(newTagIds)
    setSearchText('')
  }

  const handleTagRemove = (tagId) => {
    const newTagIds = selectedTagIds.filter(id => id !== tagId)
    onChange(newTagIds)
  }

  return (
    <div className="tag-selector" style={{ marginTop: '10px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        标签：
      </label>

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              isRemovable={true}
              onRemove={handleTagRemove}
            />
          ))}
        </div>
      )}

      {/* 标签选择下拉框 */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ color: unselectedTags.length === 0 ? '#999' : '#333' }}>
            {unselectedTags.length === 0 ? '没有更多标签可选' : '+ 添加标签'}
          </span>
          <span style={{ fontSize: '12px' }}>▼</span>
        </div>

        {isOpen && unselectedTags.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '4px',
              zIndex: '100',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {/* 搜索框 */}
            <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
              <input
                type="text"
                placeholder="搜索标签..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                autoFocus
              />
            </div>

            {/* 标签列表 */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredTags.length > 0 ? (
                filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    onClick={() => handleTagSelect(tag.id)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: '1px solid #f0f0f0',
                      ':hover': {
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5f5f5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <TagBadge tag={tag} />
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                  没有匹配的标签
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


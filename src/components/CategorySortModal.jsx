import { useState, useEffect, useRef } from 'react'
import { Modal } from './Modal'
import Sortable from 'sortablejs'

export const CategorySortModal = ({ isOpen, categories = [], onClose, onSave }) => {
  const [sortedCategories, setSortedCategories] = useState([])
  const listRef = useRef(null)
  const sortableRef = useRef(null)

  useEffect(() => {
    setSortedCategories([...categories])
  }, [isOpen, categories])

  useEffect(() => {
    if (isOpen && listRef.current && !sortableRef.current) {
      sortableRef.current = new Sortable(listRef.current, {
        animation: 200,
        ghostClass: 'dragging',
        chosenClass: 'drag-over',
        dragClass: 'dragging',
        forceFallback: true,
        fallbackTolerance: 3,
        onEnd: () => {
          const newOrder = Array.from(listRef.current.children)
            .map(el => el.getAttribute('data-category-id'))
          setSortedCategories(
            sortedCategories.sort((a, b) =>
              newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
            )
          )
        }
      })
    }

    return () => {
      if (sortableRef.current && !isOpen) {
        sortableRef.current.destroy()
        sortableRef.current = null
      }
    }
  }, [isOpen, sortedCategories])

  const handleSave = async () => {
    const categoryIds = sortedCategories.map(cat => cat.id)
    await onSave(categoryIds)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="排序方向">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#666', marginBottom: '15px' }}>拖拽下方方向来重新排序：</p>
        <div
          ref={listRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {sortedCategories.map((category) => (
            <div
              key={category.id}
              data-category-id={category.id}
              style={{
                padding: '12px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'move',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <span style={{ fontSize: '18px', color: '#999' }}>⋮⋮</span>
              <span style={{ fontWeight: '500', color: '#2c3e50', flex: 1 }}>
                {category.name}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                ({category.tools?.length || 0} 个工具)
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-success" onClick={handleSave}>
          保存排序
        </button>
      </div>
    </Modal>
  )
}


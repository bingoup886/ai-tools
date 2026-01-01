import { useState, useRef, useEffect } from 'react'
import { Header } from './components/Header'
import { CategoryCard } from './components/CategoryCard'
import { PasswordModal } from './components/PasswordModal'
import { CategoryModal } from './components/CategoryModal'
import { ToolModal } from './components/ToolModal'
import { useData } from './hooks/useData'
import Sortable from 'sortablejs'

function App() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showToolModal, setShowToolModal] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [editingTool, setEditingTool] = useState(null)
  const categoriesContainerRef = useRef(null)
  const categorySortableRef = useRef(null)

  const {
    data,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    addTool,
    updateTool,
    deleteTool,
    vote,
    sortCategories,
    sortTools
  } = useData()

  // Initialize Sortable for categories
  useEffect(() => {
    if (isEditMode && categoriesContainerRef.current && !categorySortableRef.current) {
      categorySortableRef.current = new Sortable(categoriesContainerRef.current, {
        animation: 200,
        ghostClass: 'dragging',
        chosenClass: 'drag-over',
        dragClass: 'dragging',
        forceFallback: true,
        fallbackTolerance: 3,
        onEnd: async (evt) => {
          if (evt.oldIndex !== evt.newIndex) {
            const sortedCategories = Array.from(categoriesContainerRef.current.children)
              .map(el => el.getAttribute('data-category-id'))
            await sortCategories(sortedCategories)
          }
        }
      })
    }

    return () => {
      if (categorySortableRef.current && !isEditMode) {
        categorySortableRef.current.destroy()
        categorySortableRef.current = null
      }
    }
  }, [isEditMode, sortCategories])

  const handleToggleMode = () => {
    if (isEditMode) {
      setIsEditMode(false)
    } else {
      setShowPasswordModal(true)
    }
  }

  const handlePasswordSuccess = () => {
    setIsEditMode(true)
  }

  const handleAddCategory = async (name) => {
    const success = await addCategory(name)
    if (success) {
      setShowCategoryModal(false)
    } else {
      alert('添加分类失败')
    }
  }

  const handleUpdateCategoryName = async (categoryId, name) => {
    const success = await updateCategory(categoryId, name)
    if (!success) {
      alert('更新分类失败')
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (confirm('确定要删除这个分类吗？')) {
      const success = await deleteCategory(categoryId)
      if (!success) {
        alert('删除分类失败')
      }
    }
  }

  const handleAddTool = (categoryId) => {
    setCurrentCategoryId(categoryId)
    setEditingTool(null)
    setShowToolModal(true)
  }

  const handleEditTool = (categoryId, tool) => {
    setCurrentCategoryId(categoryId)
    setEditingTool(tool)
    setShowToolModal(true)
  }

  const handleSubmitTool = async (toolData) => {
    if (editingTool) {
      const success = await updateTool(editingTool.id, toolData)
      if (!success) {
        alert('更新工具失败')
      }
    } else {
      const success = await addTool(currentCategoryId, toolData)
      if (!success) {
        alert('添加工具失败')
      }
    }
    setShowToolModal(false)
    setEditingTool(null)
    setCurrentCategoryId(null)
  }

  const handleDeleteTool = async (toolId) => {
    if (confirm('确定要删除这个工具吗？')) {
      const success = await deleteTool(toolId)
      if (!success) {
        alert('删除工具失败')
      }
    }
  }

  const handleVote = async (toolId, voteType) => {
    const success = await vote(toolId, voteType)
    if (!success) {
      alert('投票失败')
    }
  }

  if (loading) {
    return (
      <div>
        <Header isEditMode={isEditMode} onToggleMode={handleToggleMode} />
        <div className="container">
          <div className="empty-state">加载中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Header isEditMode={isEditMode} onToggleMode={handleToggleMode} />
        <div className="container">
          <div className="empty-state">加载失败: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header isEditMode={isEditMode} onToggleMode={handleToggleMode} />

      <div className="container">
        {isEditMode && (
          <div className="add-category-section show">
            <button className="btn btn-success" onClick={() => setShowCategoryModal(true)}>
              ➕ 添加新方向
            </button>
          </div>
        )}

        <div ref={categoriesContainerRef} id="categoriesContainer">
          {data.categories && data.categories.length > 0 ? (
            data.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isEditMode={isEditMode}
                onEdit={() => {}}
                onDelete={handleDeleteCategory}
                onAddTool={handleAddTool}
                onEditTool={handleEditTool}
                onDeleteTool={handleDeleteTool}
                onVote={handleVote}
                onUpdateCategoryName={handleUpdateCategoryName}
                onSortTools={sortTools}
              />
            ))
          ) : (
            <div className="empty-state">
              暂无工具分类，{isEditMode ? '点击上方按钮添加新方向' : '敬请期待'}
            </div>
          )}
        </div>
      </div>

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleAddCategory}
      />

      <ToolModal
        isOpen={showToolModal}
        onClose={() => {
          setShowToolModal(false)
          setEditingTool(null)
          setCurrentCategoryId(null)
        }}
        onSubmit={handleSubmitTool}
        initialValue={editingTool}
      />
    </div>
  )
}

export default App


import {useEffect, useRef, useState} from 'react'
import {Header} from './components/Header'
import {CategoryCard} from './components/CategoryCard'
import {PasswordModal} from './components/PasswordModal'
import {CategoryModal} from './components/CategoryModal'
import {CategorySortModal} from './components/CategorySortModal'
import {ToolModal} from './components/ToolModal'
import {useData} from './hooks/useData'

function App() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCategorySortModal, setShowCategorySortModal] = useState(false)
  const [showToolModal, setShowToolModal] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState(null)
  const [editingTool, setEditingTool] = useState(null)
  const categoriesContainerRef = useRef(null)

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
    sortTools,
    tags,
    loadTags,
    addTag,
    setToolTags
  } = useData()

  // 加载标签
  useEffect(() => {
    loadTags()
  }, [])


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
    const { tagIds, ...toolInfo } = toolData

    try {
      if (editingTool) {
        const success = await updateTool(editingTool.id, toolInfo)
        if (success && tagIds) {
          await setToolTags(editingTool.id, tagIds)
        }
        if (!success) {
          alert('更新工具失败')
          return
        }
      } else {
        const result = await addTool(currentCategoryId, toolInfo)
        if (!result) {
          alert('添加工具失败')
          return
        }

        if (tagIds && tagIds.length > 0) {
          // 获取新添加工具的 ID
          const response = await fetch('/api/categories')
          if (response.ok) {
            const data = await response.json()
            const category = data.categories.find(c => c.id === currentCategoryId)
            if (category && category.tools.length > 0) {
              const newTool = category.tools[category.tools.length - 1]
              await setToolTags(newTool.id, tagIds)
            }
          }
        }
      }
    } catch (err) {
      console.error('保存工具失败:', err)
      alert('保存工具失败，请重试')
      return
    }

    // 只在所有操作成功后才关闭弹框
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

  const handleCreateTag = async (tagData) => {
    try {
      const success = await addTag(tagData)
      if (success) {
        // 标签创建成功后，loadTags 会被调用，返回新标签
        // 这里需要找到新创建的标签并返回
        const response = await fetch('/api/tags')
        if (response.ok) {
          const allTags = await response.json()
          const newTag = allTags.find(tag => tag.slug === tagData.slug)
          return newTag
        }
      }
      return null
    } catch (err) {
      console.error('创建标签失败:', err)
      return null
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
      <Header
        isEditMode={isEditMode}
        onToggleMode={handleToggleMode}
        onOpenSortModal={() => setShowCategorySortModal(true)}
      />

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

      <CategorySortModal
        isOpen={showCategorySortModal}
        categories={data.categories || []}
        onClose={() => setShowCategorySortModal(false)}
        onSave={sortCategories}
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
        availableTags={tags}
        onCreateTag={handleCreateTag}
      />
    </div>
  )
}

export default App


import { useState, useEffect } from 'react'

const API_ENDPOINT = '/api'

export const useData = () => {
  const [data, setData] = useState({ categories: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_ENDPOINT}/categories`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        setError('Failed to load data')
        setData({ categories: [] })
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err.message)
      setData({ categories: [] })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const addCategory = async (name) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error adding category:', err)
      return false
    }
  }

  const updateCategory = async (id, name) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/categories`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating category:', err)
      return false
    }
  }

  const deleteCategory = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/categories?id=${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error deleting category:', err)
      return false
    }
  }

  const addTool = async (categoryId, toolData) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          ...toolData
        })
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error adding tool:', err)
      return false
    }
  }

  const updateTool = async (toolId, toolData) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/tools`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: toolId, ...toolData })
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating tool:', err)
      return false
    }
  }

  const deleteTool = async (toolId) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/tools?id=${toolId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadData()
        return true
      }
      return false
    } catch (err) {
      console.error('Error deleting tool:', err)
      return false
    }
  }

  const vote = async (toolId, voteType) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: toolId, vote_type: voteType })
      })
      if (response.ok) {
        const voteData = await response.json()
        // 局部更新：只更新对应工具的投票数，不重新加载整个页面
        setData(prevData => {
          const newData = JSON.parse(JSON.stringify(prevData))
          const category = newData.categories.find(cat =>
            cat.tools.some(tool => tool.id === toolId)
          )
          if (category) {
            const tool = category.tools.find(t => t.id === toolId)
            if (tool) {
              tool.upvotes = voteData.upvotes
              tool.downvotes = voteData.downvotes
            }
          }
          return newData
        })
        return true
      }
      return false
    } catch (err) {
      console.error('Error voting:', err)
      return false
    }
  }

  const sortCategories = async (categoryIds) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'categories', items: categoryIds })
      })
      return response.ok
    } catch (err) {
      console.error('Error sorting categories:', err)
      return false
    }
  }

  const sortTools = async (categoryId, toolIds) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tools', category_id: categoryId, items: toolIds })
      })
      return response.ok
    } catch (err) {
      console.error('Error sorting tools:', err)
      return false
    }
  }

  return {
    data,
    loading,
    error,
    loadData,
    addCategory,
    updateCategory,
    deleteCategory,
    addTool,
    updateTool,
    deleteTool,
    vote,
    sortCategories,
    sortTools
  }
}


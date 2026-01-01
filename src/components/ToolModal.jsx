import {useEffect, useState} from 'react'
import {Modal} from './Modal'
import {TagSelector} from './TagSelector'

export const ToolModal = ({ isOpen, onClose, onSubmit, initialValue = null, availableTags = [], onCreateTag }) => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState([])

  useEffect(() => {
    if (initialValue) {
      setName(initialValue.name || '')
      setUrl(initialValue.url || '')
      setDescription(initialValue.description || '')
      setSelectedTagIds(initialValue.tags?.map(tag => tag.id) || [])
    } else {
      setName('')
      setUrl('')
      setDescription('')
      setSelectedTagIds([])
    }
  }, [isOpen, initialValue])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const trimmedUrl = url.trim()
    const trimmedDesc = description.trim()

    if (!trimmedName || !trimmedUrl) {
      alert('请填写完整信息')
      return
    }

    onSubmit({
      name: trimmedName,
      url: trimmedUrl,
      description: trimmedDesc,
      tagIds: selectedTagIds
    })

    setName('')
    setUrl('')
    setDescription('')
    setSelectedTagIds([])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit()
    }
  }

  const title = initialValue ? '编辑工具' : '添加新工具'
  const buttonText = initialValue ? '保存' : '添加'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="form-group">
        <label>工具名称：</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例如：Notion"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label>工具网址：</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例如：https://notion.so"
        />
      </div>
      <div className="form-group">
        <label>工具描述：</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="简单描述这个工具的功能和特点"
          rows="3"
        />
      </div>
      <TagSelector
        availableTags={availableTags}
        selectedTagIds={selectedTagIds}
        onChange={setSelectedTagIds}
        onCreateTag={onCreateTag}
      />
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-success" onClick={handleSubmit}>
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}


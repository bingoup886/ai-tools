import { useState, useEffect } from 'react'
import { Modal } from './Modal'

export const CategoryModal = ({ isOpen, onClose, onSubmit, initialValue = '' }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    setName(initialValue)
  }, [isOpen, initialValue])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      alert('请输入方向名称')
      return
    }
    onSubmit(trimmedName)
    setName('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="添加新方向">
      <div className="form-group">
        <label>方向名称：</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例如：笔记应用、开发工具"
          autoFocus
        />
      </div>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-success" onClick={handleSubmit}>
          添加
        </button>
      </div>
    </Modal>
  )
}


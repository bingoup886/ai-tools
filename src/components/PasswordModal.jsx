import {useState} from 'react'
import {Modal} from './Modal'
import {usePassword} from '../hooks/usePassword'

export const PasswordModal = ({isOpen, onClose, onSuccess}) => {
	const [password, setPassword] = useState('')
	const {verifyPassword} = usePassword()

	const handleSubmit = () => {
		if (verifyPassword(password)) {
			onSuccess()
			setPassword('')
			onClose()
		} else {
			alert('密令错误！')
		}
	}

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSubmit()
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="输入维护密令">
			<div className="form-group">
				<label>密令：</label>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="请输入密令"
					autoFocus
				/>
			</div>
			<div className="modal-actions">
				<button className="btn btn-danger" onClick={onClose}>
					取消
				</button>
				<button className="btn btn-success" onClick={handleSubmit}>
					确认
				</button>
			</div>
		</Modal>
	)
}


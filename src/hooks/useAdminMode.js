import {useCallback, useState} from 'react'

const CLICK_THRESHOLD = 5 // 点击次数阈值
const RESET_TIME = 3000 // 3秒内没有新点击则重置计数

export const useAdminMode = () => {
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [showAdminHint, setShowAdminHint] = useState(false)

  const handleLogoClick = useCallback(() => {
    const now = Date.now()

    // 如果距离上次点击超过3秒，重置计数
    if (now - lastClickTime > RESET_TIME) {
      setClickCount(1)
    } else {
      setClickCount(prev => prev + 1)
    }

    setLastClickTime(now)

    // 当达到阈值时，显示提示
    if (clickCount + 1 === CLICK_THRESHOLD) {
      setShowAdminHint(true)
      // 3秒后隐藏提示
      setTimeout(() => setShowAdminHint(false), 3000)
    }
  }, [clickCount, lastClickTime])

  // 重置点击计数
  const resetClickCount = useCallback(() => {
    setClickCount(0)
    setLastClickTime(0)
    setShowAdminHint(false)
  }, [])

  return {
    clickCount,
    showAdminHint,
    handleLogoClick,
    resetClickCount,
    isAdminModeTriggered: clickCount >= CLICK_THRESHOLD
  }
}


import React from 'react'

export const Banner = ({ onLogoClick, showAdminHint }) => {
  return (
    <div className="site-banner">
      <div className="banner-content">
        <h1
          className="logo-clickable"
          onClick={onLogoClick}
          title="点击Logo进入管理员模式"
        >
          Geek工具导航站
        </h1>
        <p>发现 · 分享 · 创造 —— 极客们的专属工具箱</p>
      </div>
      {showAdminHint && (
        <div className="admin-hint">
          ✨ 管理员模式已激活！
        </div>
      )}
    </div>
  )
}


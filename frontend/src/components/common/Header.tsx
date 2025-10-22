import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-800 lg:text-2xl">
              讀書會平台
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-800">
                  首頁
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-800">
                  關於我們
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-800"
                >
                  登入
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
                >
                  註冊
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-800"
                >
                  儀表板
                </Link>
                <Link to="/clubs" className="text-gray-700 hover:text-blue-800">
                  讀書會
                </Link>
                <Link to="/search" className="text-gray-700 hover:text-blue-800">
                  探索
                </Link>
                <Link
                  to="/notifications"
                  className="text-gray-700 hover:text-blue-800"
                >
                  🔔
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
                    aria-label="用戶選單"
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-800 text-white">
                        {user?.display_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span>{user?.display_name}</span>
                    <span className="text-sm">▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          個人檔案
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          設定
                        </Link>
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          登出
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile Menu Button (Placeholder) */}
          <div className="lg:hidden">
            <button className="text-gray-700" aria-label="開啟選單">
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

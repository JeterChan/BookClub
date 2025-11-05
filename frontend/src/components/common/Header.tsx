import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getAvatarUrl } from '../../services/profileService'

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between lg:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-800 lg:text-2xl">
              OnlineBookClub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-blue-800">
                  首頁
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
                  探索讀書會
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
                        key={user.avatar_url} // Force re-render when avatar changes
                        src={getAvatarUrl(user.avatar_url)}
                        alt={user.display_name}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          個人儀表板
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          個人檔案設定
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
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 p-2" 
              aria-label="開啟選單"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!isAuthenticated ? (
                <>
                  <Link 
                    to="/" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    首頁
                  </Link>
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    登入
                  </Link>
                  <Link 
                    to="/register" 
                    className="block px-3 py-2 rounded-md bg-blue-800 text-white hover:bg-blue-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    註冊
                  </Link>
                </>
              ) : (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-3 border-b border-gray-200">
                    {user?.avatar_url ? (
                      <img
                        key={user.avatar_url} // Force re-render when avatar changes
                        src={getAvatarUrl(user.avatar_url)}
                        alt={user.display_name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-800 text-white">
                        {user?.display_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.display_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    儀表板
                  </Link>
                  <Link 
                    to="/clubs" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    探索
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    通知
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    個人檔案設定
                  </Link>
                  
                  <div className="border-t border-gray-200 my-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    登出
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

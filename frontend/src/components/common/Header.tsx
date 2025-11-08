import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { getAvatarUrl } from '../../services/profileService'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  
  // Notification state
  const { unreadCount, fetchNotifications } = useNotificationStore()

  // 當用戶登入時自動獲取通知
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications()
    }
  }, [isAuthenticated, user, fetchNotifications])

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  // Logo 點擊處理：已登入導向 welcome，未登入導向首頁
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/welcome')
    } else {
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between lg:h-16">
          {/* Logo */}
          <a href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
            <img 
              src="/open-book.png" 
              alt="OnlineBookClub Logo" 
              className="h-8 w-8 lg:h-10 lg:w-10"
            />
            <span className="text-xl font-bold text-gray-900 lg:text-2xl">
              OnlineBookClub
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-700 hover:text-gray-900">
                  首頁
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  登入
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                  註冊
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  儀表板
                </Link>
                <Link to="/clubs" className="text-gray-700 hover:text-gray-900">
                  探索讀書會
                </Link>
                {/* Notification Bell */}
                <Link 
                  to="/notifications" 
                  className="relative text-gray-700 hover:text-gray-900 p-2"
                  aria-label="通知"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white">
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
                    className="block px-3 py-2 rounded-md bg-black text-white hover:bg-gray-800"
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
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
                    探索讀書會
                  </Link>
                  <Link 
                    to="/notifications" 
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>通知</span>
                    {unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
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

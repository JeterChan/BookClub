import { useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'login' | 'register') => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => onSwitchMode('login')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              mode === 'login'
                ? 'text-[#04c0f4] border-b-2 border-[#04c0f4]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            登入
          </button>
          <button
            onClick={() => onSwitchMode('register')}
            className={`flex-1 py-4 text-center font-semibold transition-colors ${
              mode === 'register'
                ? 'text-[#04c0f4] border-b-2 border-[#04c0f4]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            註冊
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 sm:p-8">
          {mode === 'login' ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={() => onSwitchMode('login')} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <p>
              還沒有帳號?{' '}
              <button
                onClick={() => onSwitchMode('register')}
                className="text-[#04c0f4] hover:text-[#0398c4] font-medium"
              >
                立即註冊
              </button>
            </p>
          ) : (
            <p>
              已經有帳號了?{' '}
              <button
                onClick={() => onSwitchMode('login')}
                className="text-[#04c0f4] hover:text-[#0398c4] font-medium"
              >
                前往登入
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

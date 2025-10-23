import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('正在驗證您的 Email...');
  const hasVerified = useRef(false);

  useEffect(() => {
    // 防止 React StrictMode 造成的重複呼叫
    if (hasVerified.current) {
      return;
    }

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('無效的驗證連結。');
      return;
    }

    const verify = async () => {
      try {
        hasVerified.current = true;
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email 驗證成功！');
      } catch (error: any) {
        setStatus('error');
        const detail = error.response?.data?.detail || '驗證失敗，請稍後再試或重新申請驗證信。';
        setMessage(detail);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {status === 'verifying' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">驗證中...</h1>
            <p className="text-gray-700 text-lg">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">驗證成功！</h1>
            <p className="text-gray-700 text-lg mb-6">{message}</p>
            <Link to="/login">
              <Button>前往登入</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-4">驗證失敗</h1>
            <p className="text-gray-700 text-lg mb-6">{message}</p>
            <Link to="/login">
              <Button variant="outline">返回登入頁面</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

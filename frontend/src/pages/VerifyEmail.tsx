import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import type { ApiError } from '../types/error';
import { Button } from '../components/ui/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('驗證連結無效或缺失。');
      return;
    }

    const handleVerification = async () => {
      try {
        const response = await authService.verifyEmail(token);
        if (response.success) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('error');
          setErrorMessage(response.message || '驗證失敗，請稍後再試。');
        }
      } catch (err) {
        const apiError = err as ApiError;
        setVerificationStatus('error');
        setErrorMessage(apiError.response?.data?.detail || '發生未知錯誤，請聯繫客服。');
      }
    };

    handleVerification();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md text-center">
        {verificationStatus === 'verifying' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">驗證中...</h1>
            <p className="text-gray-700 text-lg">請稍候，我們正在驗證您的帳號。</p>
          </>
        )}
        {verificationStatus === 'success' && (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">驗證成功！</h1>
            <p className="text-gray-700 text-lg mb-6">您的帳號已成功啟用。</p>
            <Link to="/login">
              <Button>前往登入</Button>
            </Link>
          </>
        )}
        {verificationStatus === 'error' && (
          <>
            <h1 className="text-3xl font-bold text-red-600 mb-4">驗證失敗</h1>
            <p className="text-gray-700 text-lg mb-6">{errorMessage}</p>
            <Link to="/login">
              <Button variant="outline">返回登入頁面</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
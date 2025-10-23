import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginFormData } from '../types/auth';

const loginSchema = z.object({
  email: z.string().email("請輸入有效的 Email 地址"),
  password: z.string().min(1, "請輸入密碼"),
  rememberMe: z.boolean().optional()
});

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setEmailNotVerified(false);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });
      login(response, data.rememberMe || false);
      toast.success('登入成功！正在跳轉...');
      navigate('/dashboard');
    } catch (error: any) {
      const detail = error.response?.data?.detail || '登入失敗，請檢查您的帳號或密碼。';
      if (detail === "請先完成 Email 驗證") {
        setEmailNotVerified(true);
        setEmailForResend(getValues('email'));
        toast.error(detail, { id: 'verify-email-toast' });
      } else {
        toast.error(detail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const response = await authService.googleLogin(credentialResponse.credential);
        loginWithGoogle(response);
        toast.success('Google 登入成功！');
        if (response.is_new_user && response.needs_display_name) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        toast.error('Google 登入失敗，請稍後再試。');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!emailForResend) return;
    try {
      await authService.resendVerificationEmail(emailForResend);
      toast.success('新的驗證信已寄出，請檢查您的信箱。');
      setEmailNotVerified(false);
    } catch (error) {
      toast.error('無法重新發送驗證信，請稍後再試。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">歡迎回來</h1>
          <p className="mt-2 text-gray-600">登入您的帳號以繼續</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
            />
            <Input
              label="密碼"
              type="password"
              placeholder="請輸入密碼"
              error={errors.password?.message}
              {...register('password')}
              autoComplete="current-password"
            />

            {emailNotVerified && (
              <div className="text-center text-sm text-red-600">
                您的 Email 尚未驗證。
                <button type="button" onClick={handleResendVerification} className="underline font-semibold ml-1">
                  點此重新發送驗證信
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Checkbox {...register('rememberMe')}>記住我</Checkbox>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                忘記密碼？
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting} fullWidth disabled={isSubmitting}>
              {isSubmitting ? '登入中...' : '登入'}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google 登入失敗，請稍後再試。')}
                useOneTap
              />
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？
              <Link to="/register" className="ml-1 text-blue-600 hover:text-blue-700 hover:underline font-medium">
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

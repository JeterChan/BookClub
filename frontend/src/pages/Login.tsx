import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginFormData } from '../types/auth';
import type { ApiError } from '../types/error';

const loginSchema = z.object({
  email: z.string().email("請輸入有效的 Email 地址"),
  password: z.string().min(1, "請輸入密碼"),
  rememberMe: z.boolean().optional()
});

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [emailForResend, setEmailForResend] = useState('');

  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

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

      setPasswordError(undefined);

      try {

        const response = await authService.login({

          email: data.email,

          password: data.password

        });

        login(response, data.rememberMe || false);

        toast.success('登入成功！正在跳轉...');

        navigate('/welcome');

      } catch (err) {

        console.log(err);

        const apiError = err as ApiError;

        const detail = apiError.response?.data?.detail;

        if (detail === "User not found") {

          toast.error('使用者帳號不存在');

        } else if (detail === "Incorrect email or password") {

          setPasswordError('帳號或密碼錯誤');

        } else if (detail === "請先完成 Email 驗證") {

          setEmailNotVerified(true);

          setEmailForResend(getValues('email'));

        } else if (detail && typeof detail === 'string' && detail.includes("Account is locked")) {

          // Handle account locked error
          toast.error('您的帳號因多次登入失敗已被鎖定，請等待 1 分鐘後再試。', {
            duration: 5000,
            icon: '🔒',
          });

        } else {

          toast.error('登入失敗，請稍後再試');

        }
      } finally {
        setIsSubmitting(false);
      }

    };

  const handleResendVerification = async () => {
    if (!emailForResend) return;
    try {
      await authService.resendVerificationEmail(emailForResend);
      toast.success('新的驗證信已寄出，請檢查您的信箱。');
      setEmailNotVerified(false);
    } catch {
      toast.error('無法重新發送驗證信，請稍後再試。');
    }
  };

  const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" x2="22" y1="2" y2="22"/>
    </svg>
  );

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
            <div className="relative">
              <Input
                label="密碼"
                type={showPassword ? 'text' : 'password'}
                placeholder="請輸入密碼"
                error={errors.password?.message || passwordError}
                {...register('password')}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 top-0 flex h-full items-center pr-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

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

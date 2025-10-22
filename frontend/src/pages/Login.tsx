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

const loginSchema = z.object({
  email: z.string().email("請輸入有效的 Email 地址"),
  password: z.string().min(1, "請輸入密碼"),
  rememberMe: z.boolean().optional()
});

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
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
    
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });
      
      login(response, data.rememberMe || false);
      
      toast.success('登入成功！正在跳轉...', { duration: 2000 });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorData = error.response?.data;
      
      // 處理帳號鎖定
      if (errorData?.locked_until) {
        const lockedUntil = new Date(errorData.locked_until);
        toast.error(
          `帳號已被鎖定，請於 ${lockedUntil.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })} 後再試`,
          { duration: 7000 }
        );
        return;
      }
      
      // 處理剩餘嘗試次數
      if (errorData?.remaining_attempts !== undefined) {
        const remaining = errorData.remaining_attempts;
        if (remaining > 0) {
          toast.error(
            `登入失敗，還剩 ${remaining} 次嘗試機會`,
            { duration: 5000 }
          );
        } else {
          toast.error(
            '登入失敗次數過多，帳號已被鎖定',
            { duration: 7000 }
          );
        }
        return;
      }
      
      // 一般錯誤處理
      const errorMessage = errorData?.detail || '登入失敗，請稍後再試';
      
      const errorMappings: Record<string, string> = {
        'Invalid credentials': 'Email 或密碼錯誤',
        'Invalid email or password': 'Email 或密碼錯誤',
        'Account locked': '帳號已被鎖定'
      };
      
      const message = errorMappings[errorMessage] || errorMessage;
      toast.error(message, { duration: 5000 });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            歡迎回來
          </h1>
          <p className="mt-2 text-gray-600">
            登入您的帳號以繼續
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
              {...register('email')}
              autoComplete="email"
            />

            {/* Password Input */}
            <Input
              label="密碼"
              type="password"
              placeholder="請輸入密碼"
              error={errors.password?.message}
              {...register('password')}
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                {...register('rememberMe')}
              >
                記住我
              </Checkbox>
              
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                忘記密碼？
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? '登入中...' : '登入'}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>

            {/* Google OAuth Button - Placeholder */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              disabled
              onClick={() => toast.error('Google 登入尚未實作', { duration: 3000 })}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              使用 Google 登入
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              還沒有帳號？
              <Link 
                to="/register" 
                className="ml-1 text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                立即註冊
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500">
          登入即表示您同意我們的
          <Link to="/terms" className="text-blue-600 hover:underline mx-1">
            服務條款
          </Link>
          和
          <Link to="/privacy" className="text-blue-600 hover:underline mx-1">
            隱私政策
          </Link>
        </p>
      </div>
    </div>
  );
}

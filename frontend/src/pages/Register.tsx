import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { PasswordStrengthIndicator } from '../components/forms/PasswordStrengthIndicator';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { RegisterFormData } from '../types/auth';
import type { ApiError } from '../types/error';

const registerSchema = z.object({
  displayName: z.string()
    .min(2, "顯示名稱至少 2 個字元")
    .max(50, "顯示名稱最多 50 個字元")
    .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, "僅能包含字母、數字、中文或底線"),
  email: z.string()
    .email("請輸入有效的 Email 地址"),
  password: z.string()
    .min(8, "密碼至少 8 個字元")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼需包含大小寫字母和數字"),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine(val => val === true, "請同意服務條款")
}).refine(data => data.password === data.confirmPassword, {
  message: "密碼不一致",
  path: ["confirmPassword"]
});

export default function Register() {
  const navigate = useNavigate();
  const loginWithGoogle = useAuthStore(state => state.loginWithGoogle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await authService.register({
        display_name: data.displayName,
        email: data.email,
        password: data.password
      });
      toast.success(response.message || '註冊成功！請查看您的電子郵件以完成驗證。', { duration: 5000 });
      setRegistrationSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.response?.data?.detail || '註冊失敗，請稍後再試';
      const errorMappings: Record<string, string> = {
        'A user with this email already exists.': '此 Email 已被註冊，請使用其他 Email 或直接登入。',
      };
      const message = errorMappings[errorMessage] || errorMessage;
      toast.error(message, { duration: 5000 });
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
          navigate('/complete-profile'); // 假設有一個頁面讓新用戶填寫顯示名稱
        } else {
          navigate('/dashboard');
        }
      } catch {
        toast.error('Google 登入失敗，請稍後再試。');
      }
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-4">註冊成功！</h1>
          <p className="text-gray-700 text-lg mb-6">我們已發送一封驗證信至您的電子郵件信箱，請點擊信中連結以啟用您的帳號。</p>
          <Link to="/login">
            <Button>返回登入頁面</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              建立帳號
            </h1>
            <p className="text-gray-600">
              加入線上讀書會平台
            </p>
          </div>

          <div className="my-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error('Google 登入失敗，請稍後再試。');
              }}
              useOneTap
              width="100%"
            />
          </div>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">或使用 Email 註冊</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="顯示名稱"
              placeholder="請輸入顯示名稱"
              error={errors.displayName?.message}
              {...register('displayName')}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="請輸入 Email"
              error={errors.email?.message}
              {...register('email')}
              required
            />

            <div>
              <Input
                label="密碼"
                type="password"
                placeholder="請輸入密碼"
                error={errors.password?.message}
                {...register('password')}
                required
              />
              {password && <PasswordStrengthIndicator password={password} />}
            </div>

            <Input
              label="確認密碼"
              type="password"
              placeholder="請再次輸入密碼"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              required
            />

            <Checkbox
              error={errors.agreedToTerms?.message}
              {...register('agreedToTerms')}
            >
              我同意{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                服務條款
              </Link>
              {' '}和{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                隱私政策
              </Link>
            </Checkbox>

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
            >
              {isSubmitting ? '註冊中...' : '註冊'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已經有帳號？{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                前往登入
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

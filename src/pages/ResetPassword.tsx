import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { resetPasswordSchema } from '../utils/validation';
import { toast } from 'react-hot-toast';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import AuthService from '../services/AuthService';
import { ROUTES } from '../constants/routes';

const ResetPassword = observer(() => {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Токен сброса пароля не найден');
      navigate(ROUTES.forgotPassword);
    }
  }, [token, navigate]);

  const isValid = useMemo(() => {
    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (result.success) {
      if (touched.password || touched.confirmPassword) setErrors({});
      return true;
    }
    if (touched.password || touched.confirmPassword) {
      const next: { password?: string; confirmPassword?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !next[key as keyof { password?: string; confirmPassword?: string }]) {
          if ((key === 'password' && touched.password) || 
              (key === 'confirmPassword' && touched.confirmPassword)) {
            next[key] = issue.message;
          }
        }
      }
      setErrors(next);
    }
    return false;
  }, [password, confirmPassword, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    
    if (!token) {
      toast.error('Токен сброса пароля не найден');
      return;
    }
    
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await AuthService.resetPassword(token, password);
      setIsSubmitted(true);
      toast.success(response.data.message || 'Пароль успешно изменен');
      
      setTimeout(() => {
      navigate(ROUTES.signin);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при сбросе пароля';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Фоновая надпись */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-[200px] md:text-[300px] lg:text-[400px] font-bold text-[var(--text)]/30 select-none tracking-tighter">
          xtra.dev
        </h1>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-8 rounded-2xl shadow-xl max-w-md w-full border border-[var(--border)]/30 bg-[var(--surface)]/60 backdrop-blur-xs"
      >
        <h2 className="text-3xl text-[var(--text)] text-center mb-2 font-semibold">Сброс пароля</h2>
        <p className="text-[var(--text-muted)] text-center mb-8 text-sm">
          Введите новый пароль
        </p>

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-lg mb-4">
              ✓ Пароль успешно изменен
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              Перенаправление на страницу входа...
            </p>
          </div>
        ) : (
          <>
            <FormField label="Новый пароль" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите новый пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  error={errors.password}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
                  onClick={() => setShowPassword(s => !s)}
                >
                  {showPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </FormField>

            <FormField label="Подтвердите пароль" htmlFor="confirmPassword">
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Повторите новый пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-sm"
                  onClick={() => setShowConfirmPassword(s => !s)}
                >
                  {showConfirmPassword ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </FormField>

            <Button type="submit" loading={isLoading} disabled={!isValid} className="w-full mb-4">
              Сбросить пароль
            </Button>

            <div className="text-center">
              <Link to={ROUTES.signin} className="text-sm text-[var(--brand)] hover:underline">
                Вернуться к входу
              </Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
});

export default ResetPassword;


import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { forgotPasswordSchema } from '../utils/validation';
import { toast } from 'react-hot-toast';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import AuthService from '../services/AuthService';
import { ROUTES } from '../constants/routes';

const ForgotPassword = observer(() => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});
  const navigate = useNavigate();

  const isValid = useMemo(() => {
    const result = forgotPasswordSchema.safeParse({ email });
    if (result.success) {
      if (touched.email) setErrors({});
      return true;
    }
    if (touched.email) {
      const next: { email?: string } = {};
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'email') {
          next.email = issue.message;
        }
      }
      setErrors(next);
    }
    return false;
  }, [email, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });
    
    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await AuthService.forgotPassword(email);
      setIsSubmitted(true);
      
      // В режиме разработки показываем токен (в проде удалить)
      if (response.data.resetToken) {
        toast.success(`Токен для сброса пароля (только для разработки): ${response.data.resetToken}`, { duration: 10000 });
        // В реальном приложении здесь будет сообщение о проверке email
      } else {
        toast.success(response.data.message || 'Инструкция по сбросу пароля отправлена на email');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при отправке запроса';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h2 className="text-3xl text-[var(--text)] text-center mb-2 font-semibold">Восстановление пароля</h2>
        <p className="text-[var(--text-muted)] text-center mb-8 text-sm">
          Введите ваш email, и мы отправим инструкцию по сбросу пароля
        </p>

        {isSubmitted ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-lg mb-4">
              ✓ Запрос отправлен
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              Если пользователь с таким email существует, на него будет отправлена инструкция по сбросу пароля.
            </p>
            <div className="space-y-2">
              <Link to={ROUTES.signin} className="block">
                <Button className="w-full">Вернуться к входу</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="Введите ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                error={errors.email}
              />
            </FormField>

            <Button type="submit" loading={isLoading} disabled={!isValid} className="w-full mb-4">
              Отправить инструкцию
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

export default ForgotPassword;


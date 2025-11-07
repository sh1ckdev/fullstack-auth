import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authStore } from '../stores/authStore';
import { observer } from "mobx-react-lite";
import { registerSchema } from '../utils/validation';
import { toast } from 'react-hot-toast';
import { FormField } from './ui/FormField';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import GhostCursor from './effects/GhostCursor';

interface RegisterFormProps {
  type?: 'register';
}

const RegisterForm = observer(({}: RegisterFormProps) => {
  const [bgOpacity, setBgOpacity] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; email?: boolean; password?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const isValid = useMemo(() => {
    const result = registerSchema.safeParse({ username, email, password });
    if (result.success) {
      if (submitted || touched.username || touched.email || touched.password) setErrors({});
      return true;
    }
    if (submitted || touched.username || touched.email || touched.password) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues as Array<{ path: Array<string | number>; message: string }>) {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          if ((field === 'username' && touched.username) || 
              (field === 'email' && touched.email) || 
              (field === 'password' && touched.password)) {
            fieldErrors[field] = issue.message;
          }
        }
      }
      setErrors(fieldErrors);
    }
    return false;
  }, [username, email, password, touched, submitted]);

  useEffect(() => {
    if (authStore.isAuth) {
      navigate('/profile');
    }
  }, [navigate, authStore.isAuth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ username: true, email: true, password: true });
    if (!isValid) return;
    await authStore.registration(username, email, password);
    if (authStore.isAuth) {
      toast.success('Регистрация успешна');
      const from = (location.state as any)?.from || '/profile';
      navigate(from, { replace: true });
    } else {
      toast.error(authStore.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* <GhostCursor
        color="#B19EEF"
        brightness={1}
        edgeIntensity={0}
        trailLength={50}
        inertia={0.5}
        grainIntensity={0.05}
        bloomStrength={0.1}
        bloomRadius={1.0}
        bloomThreshold={0.025}
        fadeDelayMs={1000}
        fadeDurationMs={1500}
        className="z-0"
        onOpacityChange={setBgOpacity}
      /> */}
      {/* Фоновая надпись */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: bgOpacity }}>
        <h1 className="text-[200px] md:text-[300px] lg:text-[400px] font-bold select-none tracking-tighter" style={{ color: 'color-mix(in oklab, var(--text) 30%, transparent)' }}>
          xtra.dev
        </h1>
      </div>

      {/* Полупрозрачный блок с формой */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-8 rounded-2xl shadow-xl max-w-md w-full border border-[var(--border)]/30 bg-[var(--surface)]/60 backdrop-blur-xl"
      >
        <h2 className="text-3xl text-[var(--text)] text-center mb-8 font-semibold">Регистрация</h2>

        <FormField label="Имя пользователя" htmlFor="username">
          <Input id="username" type="text" placeholder="Введите имя пользователя" value={username}
                 onChange={(e) => setUsername(e.target.value)} 
                 onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                 error={errors.username} />
        </FormField>

        <FormField label="Электронная почта" htmlFor="email">
          <Input id="email" type="email" placeholder="Введите ваш email" value={email}
                 onChange={(e) => setEmail(e.target.value)} 
                 onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                 error={errors.email} />
        </FormField>

        <FormField label="Пароль" htmlFor="password">
          <div className="relative">
            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Введите пароль"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)} 
                   onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                   error={errors.password} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    onClick={() => setShowPassword(s => !s)}>
              {showPassword ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        </FormField>

        <Button type="submit" loading={authStore.isLoading} disabled={!isValid} className="w-full">Зарегистрироваться</Button>
      </form>
    </div>
  );
});

export default RegisterForm;



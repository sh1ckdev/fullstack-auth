import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authStore } from '../stores/authStore';
import { observer } from "mobx-react-lite";
import { loginSchema } from '../utils/validation';
import { toast } from 'react-hot-toast';
import { FormField } from './ui/FormField';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ROUTES } from '../constants/routes';
import { YANDEX_CLIENT_ID, YANDEX_REDIRECT_URI } from '../utils/env';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import GhostCursor from './effects/GhostCursor';

const YANDEX_BUTTON_CONTAINER_ID = 'yandex-auth-suggest';

interface LoginFormProps {
  type?: 'signin';
}

const LoginForm = observer(({}: LoginFormProps) => {
  const [bgOpacity, setBgOpacity] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [isProcessingYandex, setIsProcessingYandex] = useState(false);
  const [isRedirectingToYandex, setIsRedirectingToYandex] = useState(false);
  const [isYandexButtonReady, setIsYandexButtonReady] = useState(false);

  const yandexClientId = YANDEX_CLIENT_ID;
  const yandexRedirectUri = useMemo(() => {
    if (YANDEX_REDIRECT_URI) {
      return YANDEX_REDIRECT_URI;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${ROUTES.signin}`;
    }
    return '';
  }, []);
  const isYandexConfigured = Boolean(yandexClientId && yandexRedirectUri);

  const isValid = useMemo(() => {
    const result = loginSchema.safeParse({ username, password });
    if (result.success) {
      if (submitted || touched.username || touched.password) setErrors({});
      return true;
    }
    if (submitted || touched.username || touched.password) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues as Array<{ path: Array<string | number>; message: string }>) {
        const field = issue.path[0];
        if (typeof field === 'string' && !fieldErrors[field]) {
          if (field === 'username' && touched.username) fieldErrors[field] = issue.message;
          if (field === 'password' && touched.password) fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
    }
    return false;
  }, [username, password, touched, submitted]);

  useEffect(() => {
    if (!isYandexConfigured || typeof window === 'undefined') {
      return;
    }

    setIsYandexButtonReady(false);

    let cancelled = false;
    let attempts = 0;

    const initSuggestButton = () => {
      const suggest = (window as any).YaAuthSuggest;

      if (!suggest || typeof suggest.init !== 'function') {
        if (attempts < 20) {
          attempts += 1;
          setTimeout(initSuggestButton, 150);
        }
        return;
      }

      const stateValue = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('yandex_oauth_state', stateValue);

      suggest
        .init(
          {
            client_id: yandexClientId,
            response_type: 'code',
            redirect_uri: yandexRedirectUri,
            state: stateValue,
          },
          window.location.origin,
          {
            view: 'button',
            parentId: YANDEX_BUTTON_CONTAINER_ID,
            buttonView: 'main',
            buttonTheme: 'dark',
            buttonSize: 'm',
            buttonBorderRadius: 12,
          }
        )
        .then(({ handler }: { handler: () => Promise<unknown> }) => {
          if (cancelled) return;
          return handler();
        })
        .then(() => {
          if (!cancelled) {
            setIsYandexButtonReady(true);
          }
        })
        .catch((error: unknown) => {
          console.error('YaAuthSuggest initialization error', error);
          if (!cancelled) {
            setIsYandexButtonReady(false);
          }
        });
    };

    initSuggestButton();

    return () => {
      cancelled = true;
      const container = document.getElementById(YANDEX_BUTTON_CONTAINER_ID);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isYandexConfigured, yandexClientId, yandexRedirectUri]);

  useEffect(() => {
    if (authStore.isAuth) {
      navigate(ROUTES.profile);
    }
  }, [navigate, authStore.isAuth]);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const returnedState = searchParams.get('state');

    if (error) {
      toast.error(`Yandex ID: ${decodeURIComponent(error)}`);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('yandex_oauth_state');
      }
      navigate(ROUTES.signin, { replace: true });
      return;
    }

    if (!code || isProcessingYandex) {
      return;
    }

    if (!yandexRedirectUri) {
      toast.error('Yandex ID: redirect URI не настроен.');
      return;
    }

    const expectedState = typeof window !== 'undefined' ? sessionStorage.getItem('yandex_oauth_state') : null;
    if (expectedState && returnedState && expectedState !== returnedState) {
      toast.error('Некорректный ответ от Yandex ID. Попробуйте снова.');
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('yandex_oauth_state');
      }
      navigate(ROUTES.signin, { replace: true });
      return;
    }

    const performLogin = async () => {
      setIsProcessingYandex(true);
      try {
        await authStore.loginWithYandex(code, yandexRedirectUri);
        toast.success('Вход через Yandex ID выполнен');
        const from = (location.state as any)?.from || ROUTES.profile;
        navigate(from, { replace: true });
      } catch (err) {
        const message = authStore.message || 'Не удалось выполнить вход через Yandex ID';
        toast.error(message);
        navigate(ROUTES.signin, { replace: true });
      } finally {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('yandex_oauth_state');
        }
        setIsProcessingYandex(false);
        setIsRedirectingToYandex(false);
      }
    };

    void performLogin();
  }, [searchParams, isProcessingYandex, authStore, navigate, location.state, yandexRedirectUri]);

  const localSubmitLoading = authStore.isLoading && !isProcessingYandex;
  const yandexButtonLoading = isRedirectingToYandex || (isProcessingYandex && authStore.isLoading);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTouched({ username: true, password: true });
    if (!isValid) return;
    authStore.setRemember(remember);
    await authStore.login(username, password);
    if (authStore.isAuth) {
      toast.success('Вход выполнен');
      const from = (location.state as any)?.from || ROUTES.profile;
      navigate(from, { replace: true });
    } else {
      toast.error(authStore.message || 'Ошибка входа');
    }
  };

  const handleYandexLogin = () => {
    if (!isYandexConfigured) {
      toast.error('Интеграция с Yandex ID недоступна. Проверьте настройки.');
      return;
    }

    const stateValue = Math.random().toString(36).slice(2, 10);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('yandex_oauth_state', stateValue);
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: yandexClientId,
      redirect_uri: yandexRedirectUri,
      scope: 'login:email login:info',
      state: stateValue,
    });

    setIsRedirectingToYandex(true);
    window.location.href = `https://oauth.yandex.ru/authorize?${params.toString()}`;
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <h1 className="text-[200px] md:text-[300px] lg:text-[400px] font-bold select-none tracking-tighter" style={{ color: 'color-mix(in oklab, var(--text) 30%, transparent)' }}>
          xtra.dev
        </h1>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-8 rounded-2xl shadow-xl max-w-md w-full border border-[var(--border)]/30 bg-[var(--surface)]/60 backdrop-blur-xs"
      >
        <h2 className="text-3xl text-[var(--text)] text-center mb-8 font-semibold">Вход</h2>

        <FormField label="Имя пользователя" htmlFor="username">
          <Input
            id="username"
            type="text"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
            error={errors.username}
            leadingIcon={<UserIcon className="h-5 w-5" />}
          />
        </FormField>

        <FormField label="Пароль" htmlFor="password">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            error={errors.password}
            leadingIcon={<LockClosedIcon className="h-5 w-5" />}
            trailingIcon={showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            trailingIconAriaLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            onTrailingIconClick={() => setShowPassword((s) => !s)}
          />
        </FormField>

        <div className="mb-6 flex items-center justify-between">
          <label htmlFor="remember" className="inline-flex items-center gap-3 cursor-pointer select-none group">
            <span className="relative">
              <input
                id="remember"
                type="checkbox"
                className="peer sr-only"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-[var(--border)] transition-all duration-200 group-hover:border-[var(--brand)]/70 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--brand)]/40 peer-checked:border-[var(--brand)] peer-checked:bg-[var(--brand)]">
                <svg
                  className="h-3 w-3 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 10.5 8.5 14 15 6" />
                </svg>
              </span>
            </span>
            <span className="text-sm text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
              Запомнить меня
            </span>
          </label>
          <Link to={ROUTES.forgotPassword} className="text-sm text-[var(--brand)] hover:underline">
            Забыли пароль?
          </Link>
        </div>

        <Button
          type="submit"
          loading={localSubmitLoading}
          disabled={!isValid || authStore.isLoading}
          className="w-full"
        >
          Войти
        </Button>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <span className="h-px flex-1 bg-[var(--border)]/60" />
            <span>или</span>
            <span className="h-px flex-1 bg-[var(--border)]/60" />
          </div>
          <div id={YANDEX_BUTTON_CONTAINER_ID} className="flex justify-center" />
          {(!isYandexButtonReady || !isYandexConfigured) && (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={handleYandexLogin}
              loading={yandexButtonLoading}
              disabled={!isYandexConfigured || authStore.isLoading}
            >
              <span className="font-medium">Войти через Yandex ID</span>
            </Button>
          )}
          {!isYandexConfigured && (
            <p className="text-xs text-center text-[var(--text-muted)]">
              Укажите VITE_YANDEX_CLIENT_ID и VITE_YANDEX_REDIRECT_URI в настройках окружения, чтобы активировать вход через Yandex ID.
            </p>
          )}
        </div>
      </form>
    </div>
  );
});

export default LoginForm;



import { useEffect } from 'react';
import { ROUTES } from '../constants/routes';

const YandexCallback = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    const payload = code
      ? { type: 'YANDEX_AUTH_SUCCESS', code, state }
      : {
          type: 'YANDEX_AUTH_ERROR',
          error: errorDescription || (error ? decodeURIComponent(error) : undefined),
        };

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      } else {
        const storageKey = 'yandex_oauth_payload';
        window.localStorage.setItem(storageKey, JSON.stringify({ payload, createdAt: Date.now() }));
      }
    } catch (err) {
      console.error('Failed to communicate with opener window', err);
    }

    window.close();

    const fallbackRedirect = () => {
      window.location.replace(ROUTES.signin);
    };

    const timeout = window.setTimeout(fallbackRedirect, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Завершаем авторизацию через Yandex ID… Это окно закроется автоматически.</p>
    </div>
  );
};

export default YandexCallback;


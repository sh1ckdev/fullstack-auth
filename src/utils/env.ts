const env = (import.meta as any).env ?? {};

const normalize = (value?: string) => {
  if (!value) {
    return '';
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const resolveFallbackApi = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  return `${normalize(window.location.origin)}/api`;
};

export const API_URL = normalize(
  env?.VITE_API_URL ?? env?.API_URL ?? resolveFallbackApi()
);

export const YANDEX_CLIENT_ID = env?.VITE_YANDEX_CLIENT_ID ?? env?.YANDEX_CLIENT_ID ?? '';
export const YANDEX_REDIRECT_URI = env?.VITE_YANDEX_REDIRECT_URI ?? env?.YANDEX_REDIRECT_URI ?? '';

if (!API_URL) {
  throw new Error('API_URL is not defined. Please set VITE_API_URL in your environment.');
}

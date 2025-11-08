const env = (import.meta as any).env ?? {};

export const API_URL = env?.VITE_API_URL || 'http://localhost:5000/api';
export const YANDEX_CLIENT_ID = env?.YANDEX_CLIENT_ID || '';
export const YANDEX_REDIRECT_URI = env?.YANDEX_REDIRECT_URI || '';



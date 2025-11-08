import axios, { AxiosRequestConfig } from 'axios';
import { API_URL } from './utils/env';
import { getAccessToken, saveAccessToken, clearAccessToken } from './utils/authToken';

const $api = axios.create({
    withCredentials: true,  
    baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true });

                if (response.data.accessToken) {
                    saveAccessToken(response.data.accessToken);

                    if (!originalRequest.headers) originalRequest.headers = {};
                    (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${response.data.accessToken}`;
                    return $api(originalRequest);
                }
            } catch (refreshError) {
                // При ошибке refresh очищаем токены и не восстанавливаем сессию
                clearAccessToken();
                // Не пробрасываем ошибку дальше, чтобы не было лишних редиректов
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { $api };

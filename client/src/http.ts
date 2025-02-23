import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

const $api = axios.create({
    withCredentials: true,  
    baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.get(`${API_URL}/refresh`, { withCredentials: true });

                if (response.data.accessToken) {
                    localStorage.setItem('token', response.data.accessToken);

                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                    return $api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Не удалось обновить токены:', refreshError);

                localStorage.removeItem('token');
            }
        }

        return Promise.reject(error);
    }
);

export { $api };

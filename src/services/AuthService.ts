import { $api } from '../http';
import { API_URL } from '../utils/env';
import { AuthResponse } from '../models/response/AuthResponse';
import { AxiosResponse } from 'axios';

export default class AuthService {
  static async login(username: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    const response = await $api.post<AuthResponse>(`${API_URL}/signin`, {
      username,
      password,
    }, {
      withCredentials: true
    });
    return response;
  }

  static async loginWithYandex(code: string, redirectUri: string): Promise<AxiosResponse<AuthResponse>> {
    const response = await $api.post<AuthResponse>(`${API_URL}/auth/yandex`, {
      code,
      redirectUri,
    }, {
      withCredentials: true
    });
    return response;
  }

  static async registration(username: string, email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
    const response = await $api.post<AuthResponse>(`${API_URL}/registration`, {
      username,
      email,
      password,
    }, {
      withCredentials: true
    });
    return response;
  }

  static async logout(): Promise<AxiosResponse<void>> {
    const response = await $api.get<void>(`${API_URL}/logout`, {
      withCredentials: true
    });
    return response;
  }

  static async forgotPassword(email: string): Promise<AxiosResponse<{ message: string; resetToken?: string }>> {
    const response = await $api.post<{ message: string; resetToken?: string }>(`${API_URL}/forgot-password`, {
      email,
    });
    return response;
  }

  static async resetPassword(token: string, password: string): Promise<AxiosResponse<{ message: string }>> {
    const response = await $api.post<{ message: string }>(`${API_URL}/reset-password`, {
      token,
      password,
    });
    return response;
  }
}
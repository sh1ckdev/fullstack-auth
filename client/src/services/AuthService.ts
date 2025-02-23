import { $api, API_URL } from '../http';
import { AuthResponse } from '../models/response/AuthResponse';

export default class AuthService {
  static async login(username: string, password: string) {
    const response = await $api.post<AuthResponse>(`${API_URL}/login`, {
      username,
      password,
    }, {
      withCredentials: true
    });
    return response;
  }

  static async registration(username: string, email: string, password: string) {
    console.log(username, email, password);
    const response = await $api.post<AuthResponse>(`${API_URL}/registration`, {
      username,
      email,
      password,
    }, {
      withCredentials: true
    });
    return response;
  }

  static async logout() {
    const response = await $api.get(`${API_URL}/logout`, {
      withCredentials: true
    });
    return response;
  }
}
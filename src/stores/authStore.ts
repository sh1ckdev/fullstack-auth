// src/stores/authStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import AuthService from '../services/AuthService';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../utils/env';
import { IUser } from '../models/IUser';
import { AuthResponse } from '../models/response/AuthResponse';
import { UserService } from '../services/UserService';
import { saveAccessToken, clearAccessToken, setRememberMe, getAccessToken } from '../utils/authToken';

class AuthStore {
  isAuth: boolean = false;
  isAdmin: boolean = false;
  user: IUser = {} as IUser;
  isLoading: boolean = false;
  message: string = '';
  lastCheckAuth: number = 0;
  private checkAuthTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    makeAutoObservable(this);
  }
  async fetchMe(): Promise<void> {
    try {
      const me = await UserService.getMe();
      this.setUser(me);
    } catch (e) {
      // ignore silently
    }
  }

  async updateMe(fields: { username?: string; email?: string; password?: string }): Promise<void> {
    try {
      this.setLoading(true);
      const { user } = await UserService.updateMe(fields);
      this.setUser(user);
      this.setMessage('Профиль обновлён');
    } catch (e) {
      this.setMessage('Не удалось обновить профиль');
    } finally {
      runInAction(() => this.setLoading(false));
    }
  }

  setAuth(bool: boolean) {
    this.isAuth = bool;
  }

  setAdmin(bool: boolean) {
    this.isAdmin = bool;
  }

  setUser(user: IUser) {
    this.user = user;
  }

  setMessage(message: string) {
    this.message = message;
  }

  setLoading(bool: boolean) {
    this.isLoading = bool;
  }

  handleServerResponse(response: { data?: { message?: string } } | undefined) {
    if (response?.data?.message) {
      this.setMessage(response.data.message);
    }
  }

  async login(username: string, password: string): Promise<void> {
    try {
      this.setLoading(true);
      const response = await AuthService.login(username, password);
      saveAccessToken(response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
      this.setMessage("Вы успешно вошли"); 
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      this.setMessage(err.response?.data?.message || 'Ошибка входа. Попробуйте еще раз.');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async loginWithYandex(code: string, redirectUri: string): Promise<void> {
    try {
      this.setLoading(true);
      const response = await AuthService.loginWithYandex(code, redirectUri);
      saveAccessToken(response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
      this.setMessage('Вы вошли через Yandex ID');
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || 'Не удалось выполнить вход через Yandex ID.';
      this.setMessage(message);
      throw err;
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async registration(username: string, email: string, password: string): Promise<void> {
    try {
      this.setLoading(true);
      const response = await AuthService.registration(username, email, password);
      saveAccessToken(response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
      this.setMessage("Успешная регистрация"); 
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      this.setMessage(err.response?.data?.message || 'Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async logout(): Promise<void> {
    try {
      await AuthService.logout();
      clearAccessToken();
      this.setAuth(false);
      this.setUser({} as IUser);
      this.setMessage("Выход из аккаунта"); 
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      this.setMessage(err.response?.data?.message || 'Ошибка выхода. Попробуйте еще раз.');
    }
  }

  async checkAuth(force = false): Promise<void> {
    // Если уже не авторизован и нет токена, не проверяем
    if (!this.isAuth && !getAccessToken()) {
      return;
    }

    // Debounce: не проверяем чаще чем раз в 5 секунд (если не force)
    const now = Date.now();
    if (!force && now - this.lastCheckAuth < 5000) {
      return;
    }
    this.lastCheckAuth = now;

    // Отменяем предыдущий запрос, если он еще выполняется
    if (this.checkAuthTimeout) {
      clearTimeout(this.checkAuthTimeout);
    }

    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      runInAction(() => {
        this.setAuth(true);
        saveAccessToken(response.data.accessToken);
        this.setUser(response.data.user);
      });
    } catch (e) {
      // При ошибке refresh полностью очищаем сессию только если это не просто истекший токен
      const err = e as AxiosError;
      if (err.response?.status === 401) {
        clearAccessToken();
        runInAction(() => {
          this.setAuth(false);
          this.setUser({} as IUser);
          this.setAdmin(false);
        });
      }
    }
  }

  setRemember(remember: boolean) {
    setRememberMe(remember);
  }

}

export const authStore = new AuthStore();

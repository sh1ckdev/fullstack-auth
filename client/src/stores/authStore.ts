// src/stores/authStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import AuthService from '../services/AuthService';
import axios from 'axios';
import { API_URL } from '../http';
import { IUser } from '../models/IUser';
import { AuthResponse } from '../models/response/AuthResponse';

class AuthStore {
  isAuth = false;
  isAdmin = false;
  user = {} as IUser;
  isLoading = false;
  message = ''; 

  constructor() {
    makeAutoObservable(this);
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

  handleServerResponse(response: any) {
    if (response.data && response.data.message) {
      this.setMessage(response.data.message); 
    }
  }

  async login(username: string, password: string) {
    try {
      this.setLoading(true);
      const response = await AuthService.login(username, password);
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
      this.setMessage("Вы успешно вошли"); 
    } catch (e) {
      console.error('Ошибка входа:', e);
      this.setMessage('Ошибка входа. Попробуйте еще раз.');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async registration(username: string, email: string, password: string) {
    try {
      this.setLoading(true);
      const response = await AuthService.registration(username, email, password);
      localStorage.setItem('token', response.data.accessToken);
      this.setAuth(true);
      this.setUser(response.data.user);
      this.setMessage("Успешная регистрация"); 
    } catch (e) {
      console.error('Ошибка регистрации:', e);
      this.setMessage('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  async logout() {
    try {
      await AuthService.logout();
      localStorage.removeItem('token');
      this.setAuth(false);
      this.setUser({} as IUser);
      this.setMessage("Выход из аккаунта"); 
    } catch (e) {
      console.error('Ошибка выхода:', e);
      this.setMessage('Ошибка выхода. Попробуйте еще раз.');
    }
  }

  async checkAuth() {
    try {
      const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
        withCredentials: true,
      });
      this.setAuth(true);
      localStorage.setItem('token', response.data.accessToken);
      this.setUser(response.data.user);
    } catch (e) {
      console.error('Ошибка проверки аутентификации:', e);
      this.setAuth(false);
      this.setUser({} as IUser);
      this.setAdmin(false);
    }
  }

}

export const authStore = new AuthStore();

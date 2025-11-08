import { makeAutoObservable, runInAction } from 'mobx';
import { API_URL } from '../utils/env';

class AppStore {
  isBackendHealthy: boolean | null = null;
  isCheckingHealth: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setHealth(state: boolean) {
    this.isBackendHealthy = state;
    this.isCheckingHealth = false;
  }

  async checkHealth(timeoutMs = 4000): Promise<void> {
    this.isCheckingHealth = true;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
      clearTimeout(timer);
      runInAction(() => this.setHealth(res.ok && res.status === 200));
    } catch {
      runInAction(() => this.setHealth(false));
    }
  }
}

export const appStore = new AppStore();



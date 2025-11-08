import { makeAutoObservable } from 'mobx';

type Theme = 'dark' | 'light';

class ThemeStore {
  theme: Theme = 'dark';

  constructor() {
    makeAutoObservable(this);
    this.loadTheme();
  }

  loadTheme() {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      this.theme = saved;
      this.applyTheme(saved);
    }
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  toggleTheme() {
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  private applyTheme(theme: Theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}

export const themeStore = new ThemeStore();


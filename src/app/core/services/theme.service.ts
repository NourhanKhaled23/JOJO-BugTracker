import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'rose' | 'ocean' | 'forest';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  currentTheme = signal<Theme>('dark');

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['light', 'dark', 'rose', 'ocean', 'forest'].includes(saved)) {
        this.setTheme(saved);
      } else {
        this.setTheme('dark');
      }
    } else {
      this.currentTheme.set('dark');
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }
    
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-rose', 'theme-ocean', 'theme-forest');
    root.classList.add(`theme-${theme}`);
    
    if (theme === 'dark' || theme === 'ocean' || theme === 'forest' || theme === 'rose') {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
  }
}

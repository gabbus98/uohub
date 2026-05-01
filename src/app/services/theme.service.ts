import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<'dark' | 'light'>(
    (localStorage.getItem('uo-theme') as 'dark' | 'light') || 'dark'
  );

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('uo-theme', this.theme());
    });
    document.documentElement.setAttribute('data-theme', this.theme());
  }

  toggle() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}

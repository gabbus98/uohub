import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PbUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<PbUser | null>(null);
  token = signal<string | null>(localStorage.getItem('pb_token'));

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.username === environment.adminUsername);

  // Compatibilità con il codice esistente che usa guildAuth
  guildAuth = this.isAuthenticated;

  modalOpen = signal(false);
  pendingArticle = signal<string | null>(null);
  loginError = signal('');

  constructor() {
    if (this.token()) {
      this.refreshToken();
    }
  }

  private refreshToken() {
    this.http.post<{ token: string; record: PbUser }>(
      `${environment.pocketbaseUrl}/api/collections/users/auth-refresh`,
      {},
      { headers: { Authorization: this.token()! } }
    ).subscribe({
      next: res => {
        this.token.set(res.token);
        this.currentUser.set(res.record);
        localStorage.setItem('pb_token', res.token);
      },
      error: () => this.logout(),
    });
  }

  login(email: string, password: string) {
    this.loginError.set('');
    this.http.post<{ token: string; record: PbUser }>(
      `${environment.pocketbaseUrl}/api/collections/users/auth-with-password`,
      { identity: email, password }
    ).subscribe({
      next: res => {
        this.token.set(res.token);
        this.currentUser.set(res.record);
        localStorage.setItem('pb_token', res.token);
        this.modalOpen.set(false);
        this.pendingArticle.set(null);
      },
      error: () => this.loginError.set('Credenziali errate. Riprova.'),
    });
  }

  logout() {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('pb_token');
  }

  openModal(pending?: string) {
    if (pending) this.pendingArticle.set(pending);
    this.loginError.set('');
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }
}

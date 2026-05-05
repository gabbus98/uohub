import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface PbUser {
  id: string;
  email?: string;
  username?: string;
  accettato?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  currentUser = signal<PbUser | null>(null);
  token = signal<string | null>(localStorage.getItem('pb_token'));

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.username === environment.adminUsername);

  guildAuth = this.isAuthenticated;

  modalOpen = signal(false);
  pendingArticle = signal<string | null>(null);
  loginError = signal('');
  registerStatus = signal<'idle' | 'pending' | 'success' | 'error'>('idle');
  registerError = signal('');

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

  login(username: string, password: string) {
    this.loginError.set('');
    this.http.post<{ token: string; record: PbUser }>(
      `${environment.pocketbaseUrl}/api/collections/users/auth-with-password`,
      { identity: username, password }
    ).subscribe({
      next: res => {
        if (!res.record.accettato && res.record.username !== environment.adminUsername) {
          this.loginError.set('Richiesta non ancora approvata dall\'admin.');
          return;
        }
        this.token.set(res.token);
        this.currentUser.set(res.record);
        localStorage.setItem('pb_token', res.token);
        this.modalOpen.set(false);
        this.pendingArticle.set(null);
      },
      error: () => this.loginError.set('Credenziali errate. Riprova.'),
    });
  }

  register(username: string, password: string) {
    this.registerStatus.set('pending');
    this.registerError.set('');
    this.http.post(
      `${environment.pocketbaseUrl}/api/collections/users/records`,
      { username, password, passwordConfirm: password }
    ).subscribe({
      next: () => this.registerStatus.set('success'),
      error: (e) => {
        this.registerStatus.set('error');
        const msg = e?.error?.data?.username?.message || e?.error?.message || 'Errore nella richiesta.';
        this.registerError.set(msg);
      },
    });
  }

  getUsers() {
    return this.http.get<{ items: PbUser[] }>(
      `${environment.pocketbaseUrl}/api/collections/users/records?perPage=200&sort=created`,
      { headers: { Authorization: this.token()! } }
    );
  }

  acceptUser(id: string) {
    return this.http.patch(
      `${environment.pocketbaseUrl}/api/collections/users/records/${id}`,
      { accettato: true },
      { headers: { Authorization: this.token()! } }
    );
  }

  rejectUser(id: string) {
    return this.http.delete(
      `${environment.pocketbaseUrl}/api/collections/users/records/${id}`,
      { headers: { Authorization: this.token()! } }
    );
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

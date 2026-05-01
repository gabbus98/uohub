import { Injectable, signal } from '@angular/core';

const GUILD_USERS = [
  { u: 'aldrath', p: 'cacciatore1' },
  { u: 'venna',   p: 'cacciatore1' },
  { u: 'gm',      p: 'admin2024'   }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  guildAuth = signal(false);
  modalOpen = signal(false);
  pendingArticle = signal<string | null>(null);
  loginError = signal('');

  openModal(pending?: string) {
    if (pending) this.pendingArticle.set(pending);
    this.loginError.set('');
    this.modalOpen.set(true);
  }

  closeModal() {
    this.modalOpen.set(false);
  }

  login(u: string, p: string): boolean {
    const ok = GUILD_USERS.some(c => c.u === u.toLowerCase() && c.p === p);
    if (ok) {
      this.guildAuth.set(true);
      this.closeModal();
      this.loginError.set('');
    } else {
      this.loginError.set('Credenziali errate. Riprova.');
    }
    return ok;
  }
}

import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService, PbUser } from '../../services/auth.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.html',
})
export class UserAdminComponent implements OnInit {
  auth = inject(AuthService);

  users = signal<PbUser[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.auth.getUsers().subscribe({
      next: res => {
        this.users.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Errore nel caricamento utenti.');
        this.loading.set(false);
      },
    });
  }

  pending() {
    return this.users().filter(u => !u.accettato && u.username !== this.auth.currentUser()?.username);
  }

  accepted() {
    return this.users().filter(u => u.accettato);
  }

  accept(u: PbUser) {
    this.auth.acceptUser(u.id).subscribe(() => this.load());
  }

  reject(u: PbUser) {
    this.auth.rejectUser(u.id).subscribe(() => this.load());
  }
}

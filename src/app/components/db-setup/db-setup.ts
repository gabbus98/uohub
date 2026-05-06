import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CollectionStatus { name: string; exists: boolean | null; count?: number; }

const DUNGEON_SCHEMA = {
  name: 'dungeons',
  type: 'base',
  listRule: '', viewRule: '',
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    { name: 'nome', type: 'text', required: true, options: {} },
    { name: 'descrizione', type: 'text', required: false, options: {} },
    { name: 'difficolta', type: 'number', required: false, options: {} },
    { name: 'bauli', type: 'json', required: false, options: {} },
    { name: 'posizione_mappa', type: 'text', required: false, options: {} },
    { name: 'screenshot', type: 'text', required: false, options: {} },
    { name: 'protezione_elementale', type: 'text', required: false, options: {} },
    { name: 'note', type: 'text', required: false, options: {} },
  ],
};

const DUNGEON_RUNS_SCHEMA = {
  name: 'dungeon_runs',
  type: 'base',
  listRule: '', viewRule: '',
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != ''",
  deleteRule: "@request.auth.id != ''",
  schema: [
    { name: 'dungeon_nome', type: 'text', required: true, options: {} },
    { name: 'monete', type: 'number', required: false, options: {} },
    { name: 'pelli', type: 'json', required: false, options: {} },
    { name: 'tempo', type: 'number', required: false, options: {} },
    { name: 'pg_count', type: 'number', required: false, options: {} },
    { name: 'partecipanti', type: 'json', required: false, options: {} },
    { name: 'data', type: 'text', required: false, options: {} },
  ],
};

@Component({
  selector: 'app-db-setup',
  imports: [FormsModule],
  templateUrl: './db-setup.html',
})
export class DbSetupComponent {
  private http = inject(HttpClient);
  private pb = environment.pocketbaseUrl;

  adminEmail = signal('');
  adminPassword = signal('');
  adminToken = signal<string | null>(null);
  authLoading = signal(false);
  authError = signal('');

  collections = signal<CollectionStatus[]>([
    { name: 'dungeons', exists: null },
    { name: 'dungeon_runs', exists: null },
  ]);
  checkLoading = signal(false);
  createLoading = signal<Record<string, boolean>>({});
  createResult = signal<Record<string, string>>({});

  // JSON editor
  jsonMethod = signal<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  jsonEndpoint = signal('');
  jsonBody = signal('{\n  \n}');
  jsonResponse = signal('');
  jsonLoading = signal(false);

  authenticate() {
    this.authLoading.set(true);
    this.authError.set('');
    const tryAuth = (url: string) => this.http.post<{ token: string }>(url, {
      identity: this.adminEmail(), email: this.adminEmail(), password: this.adminPassword(),
    });

    tryAuth(`${this.pb}/api/collections/_superusers/auth-with-password`).subscribe({
      next: res => { this.adminToken.set(res.token); this.authLoading.set(false); this.checkCollections(); },
      error: () => {
        tryAuth(`${this.pb}/api/admins/auth-with-password`).subscribe({
          next: res => { this.adminToken.set(res.token); this.authLoading.set(false); this.checkCollections(); },
          error: () => { this.authError.set('Autenticazione fallita. Verifica le credenziali superadmin.'); this.authLoading.set(false); },
        });
      },
    });
  }

  checkCollections() {
    this.checkLoading.set(true);
    const token = this.adminToken();
    const headers = token ? { Authorization: token } : undefined;

    const names = ['dungeons', 'dungeon_runs'];
    let done = 0;
    names.forEach(name => {
      this.http.get<{ totalItems: number }>(`${this.pb}/api/collections/${name}/records?perPage=1`, { headers }).subscribe({
        next: res => {
          this.collections.update(cols => cols.map(c => c.name === name ? { ...c, exists: true, count: res.totalItems } : c));
          if (++done === names.length) this.checkLoading.set(false);
        },
        error: () => {
          this.collections.update(cols => cols.map(c => c.name === name ? { ...c, exists: false } : c));
          if (++done === names.length) this.checkLoading.set(false);
        },
      });
    });
  }

  createCollection(name: string) {
    const token = this.adminToken();
    if (!token) return;
    this.createLoading.update(l => ({ ...l, [name]: true }));
    this.createResult.update(r => ({ ...r, [name]: '' }));

    const schema = name === 'dungeons' ? DUNGEON_SCHEMA : DUNGEON_RUNS_SCHEMA;
    this.http.post(`${this.pb}/api/collections`, schema, { headers: { Authorization: token } }).subscribe({
      next: () => {
        this.createResult.update(r => ({ ...r, [name]: '✓ Collection creata' }));
        this.createLoading.update(l => ({ ...l, [name]: false }));
        this.checkCollections();
      },
      error: (e) => {
        const msg = e?.error?.message || 'Errore creazione';
        this.createResult.update(r => ({ ...r, [name]: `✗ ${msg}` }));
        this.createLoading.update(l => ({ ...l, [name]: false }));
      },
    });
  }

  sendJsonRequest() {
    const token = this.adminToken();
    const endpoint = this.jsonEndpoint().startsWith('http')
      ? this.jsonEndpoint()
      : `${this.pb}${this.jsonEndpoint()}`;

    this.jsonLoading.set(true);
    this.jsonResponse.set('');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = token;

    let body: unknown = undefined;
    if (['POST', 'PATCH'].includes(this.jsonMethod())) {
      try { body = JSON.parse(this.jsonBody()); } catch { body = {}; }
    }

    const method = this.jsonMethod().toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
    const req$ = body !== undefined
      ? (this.http as any)[method](endpoint, body, { headers })
      : (this.http as any)[method](endpoint, { headers });

    req$.subscribe({
      next: (res: unknown) => {
        this.jsonResponse.set(JSON.stringify(res, null, 2));
        this.jsonLoading.set(false);
      },
      error: (e: any) => {
        this.jsonResponse.set(JSON.stringify(e?.error || e?.message || 'Errore', null, 2));
        this.jsonLoading.set(false);
      },
    });
  }

  logout() { this.adminToken.set(null); }
}

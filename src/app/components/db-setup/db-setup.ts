import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CollectionStatus { name: string; exists: boolean | null; count?: number; }

const ADMIN_RULE = `@request.auth.username = "${environment.adminUsername}"`;
const CHARACTER_OWNER_RULE = '@request.auth.id = user_id';
const CHARACTER_CREATE_RULE = '@request.auth.id != "" && @request.data.user_id = @request.auth.id';
const RUN_OWNER_RULE = `@request.auth.username = "${environment.adminUsername}" || @request.auth.id = user_id`;
const RUN_CREATE_RULE = `@request.auth.username = "${environment.adminUsername}" || (@request.auth.id != "" && @request.data.user_id = @request.auth.id)`;

const DUNGEON_SCHEMA = {
  name: 'dungeons',
  type: 'base',
  listRule: '', viewRule: '',
  createRule: ADMIN_RULE,
  updateRule: ADMIN_RULE,
  deleteRule: ADMIN_RULE,
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'descrizione', type: 'text', required: false },
    { name: 'difficolta', type: 'number', required: false },
    { name: 'bauli', type: 'json', required: false },
    { name: 'posizione_mappa', type: 'text', required: false },
    { name: 'screenshot', type: 'text', required: false },
    { name: 'protezione_elementale', type: 'text', required: false },
    { name: 'note', type: 'text', required: false },
  ],
};

const DUNGEON_RUNS_SCHEMA = {
  name: 'dungeon_runs',
  type: 'base',
  listRule: '', viewRule: '',
  createRule: RUN_CREATE_RULE,
  updateRule: RUN_OWNER_RULE,
  deleteRule: RUN_OWNER_RULE,
  fields: [
    { name: 'user_id', type: 'text', required: false },
    { name: 'dungeon_nome', type: 'text', required: true },
    { name: 'monete', type: 'number', required: false },
    { name: 'pelli', type: 'json', required: false },
    { name: 'tempo', type: 'number', required: false },
    { name: 'pg_count', type: 'number', required: false },
    { name: 'partecipanti', type: 'json', required: false },
    { name: 'data', type: 'text', required: false },
    { name: 'note', type: 'text', required: false },
  ],
};

const CREATURE_SCHEMA = {
  name: 'creatures',
  type: 'base',
  listRule: '', viewRule: '',
  createRule: ADMIN_RULE,
  updateRule: ADMIN_RULE,
  deleteRule: ADMIN_RULE,
  fields: [
    { name: 'nome', type: 'text', required: true },
    { name: 'tipo', type: 'text', required: true },
    { name: 'icona', type: 'text', required: false },
    { name: 'dungeon', type: 'text', required: false },
    { name: 'dungeons', type: 'json', required: false },
    { name: 'hp', type: 'text', required: false },
    { name: 'danno', type: 'text', required: false },
    { name: 'salute', type: 'text', required: false },
    { name: 'stamina', type: 'text', required: false },
    { name: 'mana', type: 'text', required: false },
    { name: 'str', type: 'text', required: false },
    { name: 'dex', type: 'text', required: false },
    { name: 'int', type: 'text', required: false },
    { name: 'ar', type: 'text', required: false },
    { name: 'fuoco', type: 'text', required: false },
    { name: 'freddo', type: 'text', required: false },
    { name: 'energia', type: 'text', required: false },
    { name: 'veleno', type: 'text', required: false },
    { name: 'psionico', type: 'text', required: false },
    { name: 'sacro', type: 'text', required: false },
    { name: 'malefico', type: 'text', required: false },
    { name: 'magia', type: 'text', required: false },
    { name: 'drop', type: 'text', required: false },
    { name: 'strategia', type: 'text', required: false },
    { name: 'tamabile', type: 'bool', required: false },
    { name: 'tags', type: 'json', required: false },
    { name: 'resistenze', type: 'json', required: false },
  ],
};

const CHARACTER_PROFILE_SCHEMA = {
  name: 'character_profiles',
  type: 'base',
  listRule: CHARACTER_OWNER_RULE,
  viewRule: CHARACTER_OWNER_RULE,
  createRule: CHARACTER_CREATE_RULE,
  updateRule: CHARACTER_OWNER_RULE,
  deleteRule: CHARACTER_OWNER_RULE,
  fields: [
    { name: 'user_id', type: 'text', required: true },
    { name: 'data', type: 'json', required: false },
  ],
};

type CollectionSchema =
  | typeof DUNGEON_SCHEMA
  | typeof DUNGEON_RUNS_SCHEMA
  | typeof CREATURE_SCHEMA
  | typeof CHARACTER_PROFILE_SCHEMA;

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
    { name: 'creatures', exists: null },
    { name: 'character_profiles', exists: null },
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

    const names = ['dungeons', 'dungeon_runs', 'creatures', 'character_profiles'];
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

    const schema = this.schemaFor(name);
    this.createCollectionWithFallback(name, schema, token);
  }

  repairRules(name: string) {
    const token = this.adminToken();
    if (!token) return;
    this.createLoading.update(l => ({ ...l, [name]: true }));
    this.createResult.update(r => ({ ...r, [name]: '' }));

    const body = this.rulesFor(name);
    const headers = { Authorization: token };

    this.http.patch(`${this.pb}/api/collections/${name}`, body, { headers }).subscribe({
      next: () => {
        this.createResult.update(r => ({ ...r, [name]: 'OK Permessi aggiornati' }));
        this.createLoading.update(l => ({ ...l, [name]: false }));
        this.checkCollections();
      },
      error: (error: HttpErrorResponse) => {
        this.createResult.update(r => ({ ...r, [name]: `X ${this.formatCreateError(error)}` }));
        this.createLoading.update(l => ({ ...l, [name]: false }));
      },
    });
  }

  private createCollectionWithFallback(name: string, schema: CollectionSchema, token: string) {
    const headers = { Authorization: token };
    this.http.post(`${this.pb}/api/collections`, schema, { headers }).subscribe({
      next: () => this.handleCreateSuccess(name),
      error: (modernError: HttpErrorResponse) => {
        this.http.post(`${this.pb}/api/collections`, this.toLegacySchema(schema), { headers }).subscribe({
          next: () => this.handleCreateSuccess(name),
          error: (legacyError: HttpErrorResponse) => {
            this.createResult.update(r => ({
              ...r,
              [name]: `X ${this.formatCreateError(legacyError || modernError)}`,
            }));
            this.createLoading.update(l => ({ ...l, [name]: false }));
          },
        });
      },
    });
  }

  private handleCreateSuccess(name: string) {
    this.createResult.update(r => ({ ...r, [name]: 'OK Collection creata' }));
    this.createLoading.update(l => ({ ...l, [name]: false }));
    this.checkCollections();
  }

  private toLegacySchema(schema: CollectionSchema) {
    const { fields, ...rest } = schema;
    return {
      ...rest,
      schema: fields.map(field => ({
        ...field,
        options: field.type === 'json' ? { maxSize: 2000000 } : {},
      })),
    };
  }

  private schemaFor(name: string): CollectionSchema {
    if (name === 'dungeons') return DUNGEON_SCHEMA;
    if (name === 'dungeon_runs') return DUNGEON_RUNS_SCHEMA;
    if (name === 'character_profiles') return CHARACTER_PROFILE_SCHEMA;
    return CREATURE_SCHEMA;
  }

  private rulesFor(name: string) {
    if (name === 'character_profiles') {
      return {
        listRule: CHARACTER_OWNER_RULE,
        viewRule: CHARACTER_OWNER_RULE,
        createRule: CHARACTER_CREATE_RULE,
        updateRule: CHARACTER_OWNER_RULE,
        deleteRule: CHARACTER_OWNER_RULE,
      };
    }

    if (name === 'dungeon_runs') {
      return {
        createRule: RUN_CREATE_RULE,
        updateRule: RUN_OWNER_RULE,
        deleteRule: RUN_OWNER_RULE,
        listRule: '',
        viewRule: '',
      };
    }

    return {
      createRule: ADMIN_RULE,
      updateRule: ADMIN_RULE,
      deleteRule: ADMIN_RULE,
      listRule: '',
      viewRule: '',
    };
  }

  private formatCreateError(error: HttpErrorResponse): string {
    const pbError = error?.error;
    const details = pbError?.data && Object.keys(pbError.data).length
      ? ` ${JSON.stringify(pbError.data)}`
      : '';

    return pbError?.message
      ? `${pbError.message}${details}`
      : error?.message || 'Errore creazione';
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

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface MenuSettingRecord {
  id: string;
  item_id: string;
  enabled: boolean;
}

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class MenuSettingsService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections/menu_settings/records`;

  settings = signal<Record<string, boolean>>({});
  records = signal<MenuSettingRecord[]>([]);
  loading = signal(false);
  error = signal('');

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.http.get<PbList<MenuSettingRecord>>(`${this.base}?perPage=300`).subscribe({
      next: res => {
        this.records.set(res.items);
        this.settings.set(res.items.reduce<Record<string, boolean>>((acc, item) => {
          acc[item.item_id] = item.enabled;
          return acc;
        }, {}));
        this.loading.set(false);
      },
      error: () => {
        this.settings.set({});
        this.records.set([]);
        this.loading.set(false);
      },
    });
  }

  isEnabled(itemId: string) {
    return this.settings()[itemId] !== false;
  }

  setEnabled(itemId: string, enabled: boolean, token: string) {
    const existing = this.records().find(record => record.item_id === itemId);
    const payload = { item_id: itemId, enabled };
    const request = existing
      ? this.http.patch<MenuSettingRecord>(`${this.base}/${existing.id}`, payload, { headers: this.headers(token) })
      : this.http.post<MenuSettingRecord>(this.base, payload, { headers: this.headers(token) });

    return request;
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }
}

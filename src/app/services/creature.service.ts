import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Creature } from '../models/article.model';
import { environment } from '../../environments/environment';

export type CreatureRecord = Creature & { id: string };

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class CreatureService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections/creatures/records`;

  creatures = signal<CreatureRecord[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.http.get<PbList<CreatureRecord>>(`${this.base}?perPage=500&sort=dungeon,nome`).subscribe({
      next: res => {
        this.creatures.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare le creature dal database.');
        this.loading.set(false);
      },
    });
  }

  create(data: Partial<Creature>, token: string) {
    return this.http.post<CreatureRecord>(this.base, data, { headers: this.headers(token) });
  }

  update(id: string, data: Partial<Creature>, token: string) {
    return this.http.patch<CreatureRecord>(`${this.base}/${id}`, data, { headers: this.headers(token) });
  }

  delete(id: string, token: string) {
    return this.http.delete(`${this.base}/${id}`, { headers: this.headers(token) });
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }
}

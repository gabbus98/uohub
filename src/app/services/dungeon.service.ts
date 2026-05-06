import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Dungeon, DungeonRecord, DungeonRun, DungeonRunRecord } from '../models/dungeon.model';
import { environment } from '../../environments/environment';

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class DungeonService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections`;

  dungeons = signal<DungeonRecord[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  runs = signal<DungeonRunRecord[]>([]);
  runsLoading = signal(false);

  constructor() {
    this.loadDungeons();
    this.loadRuns();
  }

  loadDungeons() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<PbList<DungeonRecord>>(`${this.base}/dungeons/records?sort=nome&perPage=100`).subscribe({
      next: res => {
        this.dungeons.set(res.items.map(d => ({
          ...d,
          bauli: this.parseJson<{ lucchetti: number }[]>(d.bauli, []),
        })));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare i dungeon. Verifica che la collection esista.');
        this.loading.set(false);
      },
    });
  }

  loadRuns() {
    this.runsLoading.set(true);
    this.http.get<PbList<DungeonRunRecord>>(`${this.base}/dungeon_runs/records?sort=-created&perPage=500`).subscribe({
      next: res => {
        this.runs.set(res.items.map(r => ({
          ...r,
          pelli: this.parseJson<{ nome: string; quantita: number }[]>(r.pelli, []),
          partecipanti: this.parseJson<{ nome: string; classe: string }[]>(r.partecipanti, []),
        })));
        this.runsLoading.set(false);
      },
      error: () => this.runsLoading.set(false),
    });
  }

  createDungeon(data: Partial<Dungeon>, token: string) {
    return this.http.post<DungeonRecord>(`${this.base}/dungeons/records`, data, { headers: this.headers(token) });
  }

  updateDungeon(id: string, data: Partial<Dungeon>, token: string) {
    return this.http.patch<DungeonRecord>(`${this.base}/dungeons/records/${id}`, data, { headers: this.headers(token) });
  }

  deleteDungeon(id: string, token: string) {
    return this.http.delete(`${this.base}/dungeons/records/${id}`, { headers: this.headers(token) });
  }

  createRun(data: Partial<DungeonRun>, token: string) {
    const body = { ...data, data: data.data || new Date().toISOString().split('T')[0] };
    return this.http.post<DungeonRunRecord>(`${this.base}/dungeon_runs/records`, body, { headers: this.headers(token) });
  }

  deleteRun(id: string, token: string) {
    return this.http.delete(`${this.base}/dungeon_runs/records/${id}`, { headers: this.headers(token) });
  }

  uniqueClasses(): string[] {
    const classes = new Set<string>();
    this.runs().forEach(r => (r.partecipanti || []).forEach(p => { if (p.classe) classes.add(p.classe); }));
    return [...classes].sort();
  }

  private parseJson<T>(value: unknown, fallback: T): T {
    if (!value) return fallback;
    if (typeof value === 'string') {
      try { return JSON.parse(value) as T; } catch { return fallback; }
    }
    return value as T;
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }
}

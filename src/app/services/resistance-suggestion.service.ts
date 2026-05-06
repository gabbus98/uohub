import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ResistanceType } from '../models/article.model';

export function normalizeResistanceText(value: string | undefined | null): string {
  const raw = String(value || '').trim().replace('−', '-');
  if (!raw) return '';
  if (raw === '-') return '-';
  if (raw.toLowerCase().includes('immune')) return 'Immune';

  const withoutPercent = raw.replace(/%/g, '').replace(/\+/g, '').trim();
  const match = withoutPercent.match(/-?\d+(?:[,.]\d+)?/);
  return match ? match[0].replace(',', '.') : withoutPercent;
}

export interface ResistanceSuggestion {
  creature_id: string;
  creature_nome: string;
  values: Partial<Record<ResistanceType, string>>;
  note?: string;
  status: 'open' | 'accepted' | 'closed';
}

export interface ResistanceSuggestionRecord extends ResistanceSuggestion {
  id: string;
  created?: string;
}

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class ResistanceSuggestionService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections/resistance_suggestions/records`;

  suggestions = signal<ResistanceSuggestionRecord[]>([]);
  loading = signal(false);
  error = signal('');

  load(token?: string | null) {
    this.loading.set(true);
    this.error.set('');
    const options = token ? { headers: this.headers(token) } : undefined;
    this.http.get<PbList<ResistanceSuggestionRecord>>(`${this.base}?sort=-created&perPage=200`, options).subscribe({
      next: res => {
        this.suggestions.set(res.items.map(item => ({
          ...item,
          status: item.status || 'open',
          values: this.parseJson<Partial<Record<ResistanceType, string>>>(item.values, {}),
        })));
        this.loading.set(false);
      },
      error: error => {
        this.error.set(error?.status === 403
          ? 'Accesso negato ai suggerimenti. Verifica di essere admin.'
          : 'Impossibile caricare i suggerimenti.');
        this.loading.set(false);
      },
    });
  }

  create(data: ResistanceSuggestion) {
    return this.http.post<ResistanceSuggestionRecord>(this.base, data);
  }

  updateStatus(id: string, status: ResistanceSuggestion['status'], token: string) {
    return this.http.patch<ResistanceSuggestionRecord>(
      `${this.base}/${id}`,
      { status },
      { headers: this.headers(token) }
    );
  }

  delete(id: string, token: string) {
    return this.http.delete(`${this.base}/${id}`, { headers: this.headers(token) });
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

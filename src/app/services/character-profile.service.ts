import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface CharacterSkill {
  id: number;
  name: string;
  value: number;
}

export interface CharacterSheet {
  nome: string;
  razza: string;
  classe: string;
  divinita: string;
  ruolo: string;
  gilda: string;
  forza: number;
  destrezza: number;
  intelligenza: number;
  skills: CharacterSkill[];
  obiettivi: string;
  note: string;
}

export interface CharacterProfileRecord {
  id: string;
  user_id: string;
  data: CharacterSheet;
}

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class CharacterProfileService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections/character_profiles/records`;

  load(userId: string, token: string) {
    const filter = encodeURIComponent(`user_id="${userId}"`);
    return this.http.get<PbList<CharacterProfileRecord>>(
      `${this.base}?filter=${filter}&perPage=1`,
      { headers: this.headers(token) }
    );
  }

  create(userId: string, data: CharacterSheet, token: string) {
    return this.http.post<CharacterProfileRecord>(
      this.base,
      { user_id: userId, data },
      { headers: this.headers(token) }
    );
  }

  update(recordId: string, data: CharacterSheet, token: string) {
    return this.http.patch<CharacterProfileRecord>(
      `${this.base}/${recordId}`,
      { data },
      { headers: this.headers(token) }
    );
  }

  delete(recordId: string, token: string) {
    return this.http.delete(`${this.base}/${recordId}`, { headers: this.headers(token) });
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }
}

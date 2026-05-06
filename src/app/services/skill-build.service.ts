import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SkillRow } from '../components/skill-calc/skill-calc';

export interface SkillBuildRecord {
  id: string;
  user_id: string;
  nome: string;
  skills: SkillRow[];
  note?: string;
  created?: string;
}

interface PbList<T> { items: T[]; totalItems: number; }

@Injectable({ providedIn: 'root' })
export class SkillBuildService {
  private http = inject(HttpClient);
  private base = `${environment.pocketbaseUrl}/api/collections/skill_builds/records`;

  load(userId: string, token: string) {
    const filter = encodeURIComponent(`user_id="${userId}"`);
    return this.http.get<PbList<SkillBuildRecord>>(
      `${this.base}?filter=${filter}&sort=-updated,-created&perPage=100`,
      { headers: this.headers(token) }
    );
  }

  create(userId: string, nome: string, skills: SkillRow[], token: string) {
    return this.http.post<SkillBuildRecord>(
      this.base,
      { user_id: userId, nome, skills },
      { headers: this.headers(token) }
    );
  }

  update(id: string, nome: string, skills: SkillRow[], token: string) {
    return this.http.patch<SkillBuildRecord>(
      `${this.base}/${id}`,
      { nome, skills },
      { headers: this.headers(token) }
    );
  }

  delete(id: string, token: string) {
    return this.http.delete(`${this.base}/${id}`, { headers: this.headers(token) });
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs';
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
        this.creatures.set(res.items.map(creature => this.normalizeCreature(creature)));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossibile caricare le creature dal database.');
        this.loading.set(false);
      },
    });
  }

  create(data: Partial<Creature>, token: string) {
    const payload = this.normalizePayload(data);
    return this.http.post<CreatureRecord>(this.base, payload, { headers: this.headers(token) }).pipe(
      catchError(() => this.http.post<CreatureRecord>(this.base, this.legacyPayload(payload), { headers: this.headers(token) }))
    );
  }

  update(id: string, data: Partial<Creature>, token: string) {
    const payload = this.normalizePayload(data);
    return this.http.patch<CreatureRecord>(`${this.base}/${id}`, payload, { headers: this.headers(token) }).pipe(
      catchError(() => this.http.patch<CreatureRecord>(`${this.base}/${id}`, this.legacyPayload(payload), { headers: this.headers(token) }))
    );
  }

  delete(id: string, token: string) {
    return this.http.delete(`${this.base}/${id}`, { headers: this.headers(token) });
  }

  private headers(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: token });
  }

  creatureDungeons(creature: Partial<Creature>): string[] {
    const raw = Array.isArray(creature.dungeons) && creature.dungeons.length
      ? creature.dungeons
      : this.splitDungeonText(creature.dungeon || '');

    return [...new Set(raw.map(d => d.trim()).filter(Boolean))];
  }

  isInDungeon(creature: Partial<Creature>, dungeonNome: string): boolean {
    const target = dungeonNome.trim().toLowerCase();
    return this.creatureDungeons(creature).some(d => d.toLowerCase() === target);
  }

  dungeonLabel(creature: Partial<Creature>): string {
    return this.creatureDungeons(creature).join(', ');
  }

  private normalizeCreature(creature: CreatureRecord): CreatureRecord {
    const dungeons = this.creatureDungeons(creature);
    return {
      ...creature,
      dungeons,
      dungeon: creature.dungeon || dungeons.join(', '),
    };
  }

  private normalizePayload(data: Partial<Creature>): Partial<Creature> {
    const clean = this.cleanPayload(data);
    if (data.dungeon === undefined && data.dungeons === undefined) {
      return clean;
    }

    const dungeons = this.creatureDungeons(data);
    return {
      ...clean,
      dungeons,
      dungeon: dungeons.join(', '),
    };
  }

  private legacyPayload(data: Partial<Creature>): Partial<Creature> {
    const { dungeons, ...legacy } = data;
    return legacy;
  }

  private splitDungeonText(value: string): string[] {
    return value.split(/[,;\n]/).map(d => d.trim()).filter(Boolean);
  }

  private cleanPayload(data: Partial<Creature>): Partial<Creature> {
    const allowed: (keyof Creature)[] = [
      'nome',
      'tipo',
      'tags',
      'tamabile',
      'icona',
      'dungeon',
      'dungeons',
      'hp',
      'danno',
      'salute',
      'stamina',
      'mana',
      'str',
      'dex',
      'int',
      'ar',
      'fuoco',
      'freddo',
      'energia',
      'veleno',
      'psionico',
      'sacro',
      'malefico',
      'magia',
      'drop',
      'strategia',
      'resistenze',
    ];

    return allowed.reduce<Partial<Creature>>((payload, key) => {
      if (data[key] !== undefined) {
        return { ...payload, [key]: data[key] };
      }
      return payload;
    }, {});
  }
}

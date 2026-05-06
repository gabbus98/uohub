import { Component, inject, computed, signal } from '@angular/core';
import { DungeonService } from '../../services/dungeon.service';
import { CreatureService, CreatureRecord } from '../../services/creature.service';
import { WikiService } from '../../services/wiki.service';
import { BestiaryComponent } from '../bestiary/bestiary';
import { DungeonRecord, DungeonRunRecord, RunStats } from '../../models/dungeon.model';
import { ResistanceType } from '../../models/article.model';

interface DungeonView {
  dungeon: DungeonRecord;
  runs: DungeonRunRecord[];
  stats: RunStats;
  damageElement: { type: string } | null;
  open: boolean;
}

@Component({
  selector: 'app-dungeon',
  imports: [BestiaryComponent],
  templateUrl: './dungeon.html',
})
export class DungeonComponent {
  private ds = inject(DungeonService);
  private cs = inject(CreatureService);
  wiki = inject(WikiService);

  loading = this.ds.loading;
  error = this.ds.error;
  stars = [1, 2, 3, 4, 5];
  bestiaryOverlay = signal<string | null>(null);

  private groupOpen: Record<string, boolean> = {};
  private resistanceTypes: ResistanceType[] = [
    'Fuoco', 'Freddo', 'Energia', 'Veleno', 'Psionico', 'Sacro', 'Male', 'Magia',
  ];

  groups = computed<DungeonView[]>(() => {
    const dungeons = this.ds.dungeons();
    const runs = this.ds.runs();
    const creatures = this.cs.creatures();

    return dungeons.map(dungeon => {
      const focused = this.wiki.dungeonFocus().toLowerCase() === dungeon.nome.toLowerCase();
      if (this.groupOpen[dungeon.id] === undefined) this.groupOpen[dungeon.id] = focused;
      if (focused) this.groupOpen[dungeon.id] = true;
      const dungeonRuns = runs.filter(r => r.dungeon_nome === dungeon.nome);
      return {
        dungeon,
        runs: dungeonRuns,
        stats: this.computeStats(dungeonRuns),
        damageElement: this.computeDamageElement(creatures, dungeon.nome),
        open: this.groupOpen[dungeon.id],
      };
    });
  });

  toggleGroup(g: DungeonView) {
    this.groupOpen[g.dungeon.id] = !this.groupOpen[g.dungeon.id];
    g.open = this.groupOpen[g.dungeon.id];
  }

  openBestiary(dungeonNome: string) {
    this.bestiaryOverlay.set(dungeonNome);
  }

  rewardLabel(lucchetti: number): string {
    const labels: Record<number, string> = {
      1: 'Molto bassa', 2: 'Bassa', 3: 'Media', 4: 'Alta', 5: 'Molto alta',
    };
    return labels[lucchetti] || '';
  }

  private computeStats(runs: DungeonRunRecord[]): RunStats {
    if (!runs.length) return { count: 0, avg_monete: 0, avg_tempo: 0, avg_pg: 0, pelli: [] };

    const count = runs.length;
    const avg_monete = Math.round(runs.reduce((s, r) => s + (r.monete || 0), 0) / count);
    const avg_tempo = Math.round(runs.reduce((s, r) => s + (r.tempo || 0), 0) / count);
    const avg_pg = Math.round(runs.reduce((s, r) => s + (r.pg_count || 0), 0) / count);

    const pelleMap: Record<string, number> = {};
    runs.forEach(r => (r.pelli || []).forEach(p => {
      pelleMap[p.nome] = (pelleMap[p.nome] || 0) + p.quantita;
    }));

    const pelli = Object.entries(pelleMap).map(([nome, total]) => ({
      nome, total, avg: Math.round((total / count) * 10) / 10,
    }));

    return { count, avg_monete, avg_tempo, avg_pg, pelli };
  }

  private computeDamageElement(creatures: CreatureRecord[], dungeonNome: string) {
    const dunCreatures = creatures.filter(c => this.cs.isInDungeon(c, dungeonNome));
    if (!dunCreatures.length) return null;

    const averages = this.resistanceTypes.map(type => {
      const values = dunCreatures
        .map(c => this.numericResistance(this.getResistance(c, type)))
        .filter((v): v is number => v !== null);
      if (!values.length) return null;
      return { type, value: values.reduce((s, v) => s + v, 0) / values.length };
    }).filter((x): x is { type: ResistanceType; value: number } => x !== null);

    if (!averages.length) return null;
    const best = averages.reduce((min, x) => x.value < min.value ? x : min);
    return { type: best.type };
  }

  private getResistance(creature: CreatureRecord, type: ResistanceType): string {
    const keys: Record<ResistanceType, keyof CreatureRecord> = {
      Fuoco: 'fuoco', Freddo: 'freddo', Energia: 'energia', Veleno: 'veleno',
      Psionico: 'psionico', Sacro: 'sacro', Male: 'malefico', Magia: 'magia',
    };
    return (creature[keys[type]] as string) || '-';
  }

  private numericResistance(value: string): number | null {
    const n = (value || '').replace('−', '-').replace('%', '').trim();
    if (!n || n === '-' || n.toLowerCase().includes('immune')) return null;
    const num = Number(n);
    return Number.isNaN(num) ? null : num;
  }
}

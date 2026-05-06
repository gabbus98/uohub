import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DungeonService } from '../../services/dungeon.service';
import { CreatureService, CreatureRecord } from '../../services/creature.service';
import { DungeonRecord, DungeonRunRecord } from '../../models/dungeon.model';
import { ResistanceType } from '../../models/article.model';

interface PartyMember {
  classe: string;
}

interface DungeonScore {
  dungeon: DungeonRecord;
  score: number;
  avg_monete: number;
  avg_tempo: number;
  avg_pg: number;
  lootPerMin: number;
  matchingRuns: number;
  totalRuns: number;
  damageElement: string | null;
  noData: boolean;
}

@Component({
  selector: 'app-party-advisor',
  imports: [FormsModule],
  templateUrl: './party-advisor.html',
})
export class PartyAdvisorComponent {
  private ds = inject(DungeonService);
  private cs = inject(CreatureService);

  party = signal<PartyMember[]>([{ classe: '' }]);
  analyzed = signal(false);

  knownClasses = computed(() => this.ds.uniqueClasses());

  private resistanceTypes: ResistanceType[] = [
    'Fuoco', 'Freddo', 'Energia', 'Veleno', 'Psionico', 'Sacro', 'Male', 'Magia',
  ];

  ranking = computed<DungeonScore[]>(() => {
    if (!this.analyzed()) return [];
    const dungeons = this.ds.dungeons();
    const runs = this.ds.runs();
    const creatures = this.cs.creatures();
    const partyClasses = this.party().map(p => p.classe.trim().toLowerCase()).filter(Boolean);

    return dungeons
      .map(dungeon => {
        const dungeonRuns = runs.filter(r => r.dungeon_nome === dungeon.nome);
        const totalRuns = dungeonRuns.length;

        if (!totalRuns) {
          return {
            dungeon, score: 0, avg_monete: 0, avg_tempo: 0, avg_pg: 0,
            lootPerMin: 0, matchingRuns: 0, totalRuns: 0,
            damageElement: this.getDamageElement(creatures, dungeon.nome),
            noData: true,
          };
        }

        const avg_monete = dungeonRuns.reduce((s, r) => s + (r.monete || 0), 0) / totalRuns;
        const avg_tempo = dungeonRuns.reduce((s, r) => s + (r.tempo || 0), 0) / totalRuns;
        const avg_pg = dungeonRuns.reduce((s, r) => s + (r.pg_count || 0), 0) / totalRuns;
        const lootPerMin = avg_tempo > 0 ? avg_monete / avg_tempo : avg_monete;

        // Runs con composizione simile: almeno una delle classi selezionate appare nel party
        const matchingRuns = partyClasses.length === 0 ? totalRuns : dungeonRuns.filter(r =>
          partyClasses.some(cls =>
            (r.partecipanti || []).some(p => p.classe.toLowerCase() === cls)
          )
        ).length;

        const matchBonus = totalRuns > 0 ? (matchingRuns / totalRuns) * 0.3 : 0;
        const score = lootPerMin * (1 + matchBonus);

        return {
          dungeon, score, avg_monete: Math.round(avg_monete), avg_tempo: Math.round(avg_tempo),
          avg_pg: Math.round(avg_pg), lootPerMin: Math.round(lootPerMin),
          matchingRuns, totalRuns,
          damageElement: this.getDamageElement(creatures, dungeon.nome),
          noData: false,
        };
      })
      .sort((a, b) => b.score - a.score);
  });

  addMember() { this.party.update(p => [...p, { classe: '' }]); }

  removeMember(i: number) {
    this.party.update(p => p.filter((_, idx) => idx !== i));
  }

  setClasse(i: number, val: string) {
    this.party.update(p => { const n = [...p]; n[i] = { classe: val }; return n; });
  }

  analyze() { this.analyzed.set(true); }

  reset() { this.analyzed.set(false); }

  private getDamageElement(creatures: CreatureRecord[], dungeonNome: string): string | null {
    const dunCreatures = creatures.filter(c => this.cs.isInDungeon(c, dungeonNome));
    if (!dunCreatures.length) return null;
    const keys: Record<ResistanceType, keyof CreatureRecord> = {
      Fuoco: 'fuoco', Freddo: 'freddo', Energia: 'energia', Veleno: 'veleno',
      Psionico: 'psionico', Sacro: 'sacro', Male: 'malefico', Magia: 'magia',
    };
    const averages = this.resistanceTypes.map(type => {
      const values = dunCreatures
        .map(c => {
          const v = (c[keys[type]] as string) || '-';
          const n = v.replace('−', '-').replace('%', '').trim();
          if (!n || n === '-' || n.toLowerCase().includes('immune')) return null;
          const num = Number(n);
          return Number.isNaN(num) ? null : num;
        })
        .filter((v): v is number => v !== null);
      if (!values.length) return null;
      return { type, value: values.reduce((s, v) => s + v, 0) / values.length };
    }).filter((x): x is { type: ResistanceType; value: number } => x !== null);
    if (!averages.length) return null;
    return averages.reduce((min, x) => x.value < min.value ? x : min).type;
  }

  rankColor(i: number): string {
    if (i === 0) return 'var(--gold)';
    if (i === 1) return 'var(--text-3)';
    if (i === 2) return '#c87941';
    return 'var(--text-muted)';
  }

  rankLabel(i: number): string {
    return ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`;
  }
}

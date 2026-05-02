import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CREATURES, DUNGEON_ARMOR_RECOMMENDATIONS } from '../../data/creatures.data';
import { Creature, ResistanceType } from '../../models/article.model';

interface DungeonGroup {
  dungeon: string;
  creatures: Creature[];
  open: boolean;
}

const CREATURE_TYPE_ORDER: Record<Creature['tipo'], number> = {
  boss: 0,
  raro: 1,
  'non-comune': 2,
  comune: 3,
  tamabile: 4,
};

@Component({
  selector: 'app-bestiary',
  imports: [FormsModule],
  templateUrl: './bestiary.html'
})
export class BestiaryComponent {
  searchQuery = signal('');
  activeFilter = signal<'all' | 'comune' | 'non-comune' | 'raro' | 'boss'>('all');
  resistanceTypes: ResistanceType[] = [
    'Fuoco',
    'Freddo',
    'Energia',
    'Veleno',
    'Psionico',
    'Sacro',
    'Malefico',
    'Magia',
  ];

  private groupOpen: Record<string, boolean> = {};

  groups = computed<DungeonGroup[]>(() => {
    const q = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();

    const filtered = CREATURES.filter(c => {
      const matchF = filter === 'all' || c.tipo === filter;
      const matchS = !q ||
        c.nome.toLowerCase().includes(q) ||
        (c.drop || '').toLowerCase().includes(q) ||
        c.dungeon.toLowerCase().includes(q);
      return matchF && matchS;
    });

    const map: Record<string, Creature[]> = {};
    filtered.forEach(c => {
      if (!map[c.dungeon]) map[c.dungeon] = [];
      map[c.dungeon].push(c);
    });

    return Object.keys(map)
      .map(d => {
        if (this.groupOpen[d] === undefined) this.groupOpen[d] = true;
        return {
          dungeon: d,
          creatures: [...map[d]].sort((a, b) =>
            CREATURE_TYPE_ORDER[a.tipo] - CREATURE_TYPE_ORDER[b.tipo] ||
            a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' })
          ),
          open: this.groupOpen[d]
        };
      });
  });

  setFilter(f: 'all' | 'comune' | 'non-comune' | 'raro' | 'boss') {
    this.activeFilter.set(f);
  }

  toggleGroup(g: DungeonGroup) {
    this.groupOpen[g.dungeon] = !this.groupOpen[g.dungeon];
    g.open = this.groupOpen[g.dungeon];
  }

  badgeLabel(tipo: string) {
    return { comune: 'COMUNE', 'non-comune': 'NON COMUNE', raro: 'RARO', boss: 'BOSS', tamabile: 'TAMABILE' }[tipo] || tipo;
  }

  isTamabile(creature: Creature) {
    return creature.tamabile || creature.tipo === 'tamabile' || creature.tags?.includes('tamabile');
  }

  statValue(creature: Creature, key: 'salute' | 'stamina' | 'mana' | 'str' | 'dex' | 'int' | 'ar') {
    if (key === 'salute') return creature.salute || creature.hp;
    return creature[key] || '-';
  }

  resistanceValue(creature: Creature, type: ResistanceType) {
    const directValue = this.directResistanceValue(creature, type);
    if (directValue) return directValue;

    if (creature.resistenze && typeof creature.resistenze === 'object') {
      return creature.resistenze[type] || '-';
    }

    return this.parseResistance(creature.resistenze || '', type);
  }

  resistanceClass(value: string) {
    const normalized = value.toLowerCase();
    if (normalized.includes('immune')) return 'immune';
    if (normalized.includes('-') || normalized.includes('−')) return 'weak';
    if (normalized.includes('+')) return 'strong';
    const numeric = Number(normalized.replace('%', '').trim());
    if (!Number.isNaN(numeric) && numeric > 0) return 'strong';
    return '';
  }

  armorRecommendation(group: DungeonGroup) {
    return DUNGEON_ARMOR_RECOMMENDATIONS[group.dungeon] || '';
  }

  bestGroupDamageElement(group: DungeonGroup) {
    const averages = this.resistanceTypes
      .map(type => {
        const values = group.creatures
          .map(creature => this.numericResistance(this.resistanceValue(creature, type)))
          .filter((value): value is number => value !== null);

        if (!values.length) return null;

        return {
          type,
          value: values.reduce((sum, value) => sum + value, 0) / values.length,
        };
      })
      .filter((item): item is { type: ResistanceType; value: number } => item !== null);

    if (!averages.length) return null;

    const best = averages.reduce((lowest, item) => item.value < lowest.value ? item : lowest);
    return {
      type: best.type,
      value: this.formatResistance(best.value),
    };
  }

  private parseResistance(raw: string, type: ResistanceType) {
    const aliases: Record<ResistanceType, string[]> = {
      Fuoco: ['Fuoco'],
      Freddo: ['Freddo'],
      Energia: ['Energia'],
      Veleno: ['Veleno'],
      Psionico: ['Psionico'],
      Sacro: ['Sacro'],
      Malefico: ['Malefico', 'Male'],
      Magia: ['Magia', 'Magico'],
    };

    for (const alias of aliases[type]) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = raw.match(new RegExp(`${escaped}\\s+(Immune|[+\\-−]?\\d+%|Fase\\s*\\d+)`, 'i'));
      if (match) return match[1].replace('−', '-');
    }

    return '-';
  }

  private directResistanceValue(creature: Creature, type: ResistanceType) {
    const keys: Record<ResistanceType, keyof Creature> = {
      Fuoco: 'fuoco',
      Freddo: 'freddo',
      Energia: 'energia',
      Veleno: 'veleno',
      Psionico: 'psionico',
      Sacro: 'sacro',
      Malefico: 'malefico',
      Magia: 'magia',
    };

    return creature[keys[type]] as string | undefined;
  }

  private numericResistance(value: string) {
    const normalized = value.replace('−', '-').replace('%', '').trim();
    if (!normalized || normalized === '-' || normalized.toLowerCase().includes('immune')) return null;

    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? null : numeric;
  }

  private formatResistance(value: number) {
    return `${value}%`;
  }
}

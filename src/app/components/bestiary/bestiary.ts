import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CREATURES } from '../../data/creatures.data';
import { Creature, ResistanceType } from '../../models/article.model';

interface DungeonGroup {
  dungeon: string;
  creatures: Creature[];
  open: boolean;
}

@Component({
  selector: 'app-bestiary',
  imports: [FormsModule],
  templateUrl: './bestiary.html'
})
export class BestiaryComponent {
  searchQuery = signal('');
  activeFilter = signal<'all' | 'comune' | 'raro' | 'boss'>('all');
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
        return { dungeon: d, creatures: map[d], open: this.groupOpen[d] };
      });
  });

  setFilter(f: 'all' | 'comune' | 'raro' | 'boss') {
    this.activeFilter.set(f);
  }

  toggleGroup(g: DungeonGroup) {
    this.groupOpen[g.dungeon] = !this.groupOpen[g.dungeon];
    g.open = this.groupOpen[g.dungeon];
  }

  badgeLabel(tipo: string) {
    return { comune: 'COMUNE', raro: 'RARO', boss: 'BOSS' }[tipo] || tipo;
  }

  statValue(creature: Creature, key: 'salute' | 'stamina' | 'mana' | 'str' | 'dex' | 'int' | 'ar') {
    if (key === 'salute') return creature.salute || creature.hp;
    return creature[key] || '-';
  }

  resistanceValue(creature: Creature, type: ResistanceType) {
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
    return '';
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
}

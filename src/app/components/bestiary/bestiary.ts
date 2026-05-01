import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CREATURES, DUNGEON_ORDER } from '../../data/creatures.data';
import { Creature } from '../../models/article.model';

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

  private groupOpen: Record<string, boolean> = {};

  groups = computed<DungeonGroup[]>(() => {
    const q = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();

    const filtered = CREATURES.filter(c => {
      const matchF = filter === 'all' || c.tipo === filter;
      const matchS = !q ||
        c.nome.toLowerCase().includes(q) ||
        c.habitat.toLowerCase().includes(q) ||
        c.drop.toLowerCase().includes(q) ||
        c.dungeon.toLowerCase().includes(q);
      return matchF && matchS;
    });

    const map: Record<string, Creature[]> = {};
    DUNGEON_ORDER.forEach(d => { map[d] = []; });
    filtered.forEach(c => {
      if (!map[c.dungeon]) map[c.dungeon] = [];
      map[c.dungeon].push(c);
    });

    return DUNGEON_ORDER
      .filter(d => map[d].length > 0)
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
}

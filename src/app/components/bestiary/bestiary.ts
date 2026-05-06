import { Component, input, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatureService } from '../../services/creature.service';
import { DungeonService } from '../../services/dungeon.service';
import { WikiService } from '../../services/wiki.service';
import { normalizeResistanceText, ResistanceSuggestionService } from '../../services/resistance-suggestion.service';
import { DUNGEON_ARMOR_RECOMMENDATIONS } from '../../data/creatures.data';
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

const DAMAGE_WEIGHT_BY_TYPE: Record<Creature['tipo'], number> = {
  comune: 4,
  tamabile: 4,
  'non-comune': 2,
  raro: 1,
  boss: 1,
};

@Component({
  selector: 'app-bestiary',
  imports: [FormsModule],
  templateUrl: './bestiary.html'
})
export class BestiaryComponent {
  private creatureService = inject(CreatureService);
  private dungeonService = inject(DungeonService);
  private wiki = inject(WikiService);
  private suggestionService = inject(ResistanceSuggestionService);

  dungeonFilter = input('');
  embedded = input(false);

  loading = this.creatureService.loading;
  error = this.creatureService.error;

  searchQuery = signal('');

  constructor() {
    const filter = this.wiki.bestiaryFilter();
    if (filter) {
      this.searchQuery.set(filter);
      this.wiki.bestiaryFilter.set('');
    }
  }
  activeFilter = signal<'all' | 'comune' | 'non-comune' | 'raro' | 'boss'>('all');
  expandedCreature = signal<Creature | null>(null);
  suggestionOpen = signal(false);
  suggestionCreature = signal<Creature | null>(null);
  suggestionName = signal('');
  suggestionDungeon = signal('');
  suggestionValues = signal<Partial<Record<ResistanceType, string>>>({});
  suggestionNote = signal('');
  suggestionSaving = signal(false);
  suggestionMessage = signal('');
  suggestionError = signal('');
  resistanceTypes: ResistanceType[] = [
    'Fuoco',
    'Freddo',
    'Energia',
    'Veleno',
    'Psionico',
    'Sacro',
    'Male',
    'Magia',
  ];

  private groupOpen: Record<string, boolean> = {};

  groups = computed<DungeonGroup[]>(() => {
    const creatures = this.creatureService.creatures();
    const fixedDungeon = this.dungeonFilter().trim();
    const q = (fixedDungeon || this.searchQuery()).toLowerCase();
    const filter = this.activeFilter();

    const filtered = creatures.filter(c => {
      const matchF = filter === 'all' || c.tipo === filter;
      const creatureDungeons = this.creatureService.creatureDungeons(c);
      const matchDungeon = !fixedDungeon || this.creatureService.isInDungeon(c, fixedDungeon);
      const matchS = !q ||
        c.nome.toLowerCase().includes(q) ||
        (c.drop || '').toLowerCase().includes(q) ||
        creatureDungeons.some(d => d.toLowerCase().includes(q));
      return matchF && matchDungeon && matchS;
    });

    const map: Record<string, Creature[]> = {};
    filtered.forEach(c => {
      this.creatureService.creatureDungeons(c)
        .filter(dungeon => !fixedDungeon || dungeon.toLowerCase() === fixedDungeon.toLowerCase())
        .forEach(dungeon => {
          if (!map[dungeon]) map[dungeon] = [];
          map[dungeon].push(c);
        });
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

  allGroupsOpen() {
    const groups = this.groups();
    return groups.length > 0 && groups.every(group => group.open);
  }

  toggleAllGroups() {
    const shouldOpen = !this.allGroupsOpen();
    this.groups().forEach(group => {
      this.groupOpen[group.dungeon] = shouldOpen;
      group.open = shouldOpen;
    });
  }

  hasDungeonSheet(dungeonNome: string) {
    const target = dungeonNome.trim().toLowerCase();
    return this.dungeonService.dungeons().some(dungeon => dungeon.nome.trim().toLowerCase() === target);
  }

  openDungeonSheet(dungeonNome: string) {
    this.wiki.navigateToDungeonFor(dungeonNome, true);
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
    if (directValue) return normalizeResistanceText(directValue) || '-';

    if (creature.resistenze && typeof creature.resistenze === 'object') {
      return normalizeResistanceText(creature.resistenze[type]) || '-';
    }

    return normalizeResistanceText(this.parseResistance(creature.resistenze || '', type)) || '-';
  }

  hasResistanceData(creature: Creature) {
    return this.resistanceTypes.some(type => this.resistanceValue(creature, type) !== '-');
  }

  openSuggestion(creature: Creature) {
    this.suggestionOpen.set(true);
    this.suggestionCreature.set(creature);
    this.suggestionName.set(creature.nome);
    this.suggestionDungeon.set('');
    this.suggestionValues.set({});
    this.suggestionNote.set('');
    this.suggestionMessage.set('');
    this.suggestionError.set('');
  }

  openGenericSuggestion() {
    this.suggestionOpen.set(true);
    this.suggestionCreature.set(null);
    this.suggestionName.set('');
    this.suggestionDungeon.set(this.searchQuery());
    this.suggestionValues.set({});
    this.suggestionNote.set('');
    this.suggestionMessage.set('');
    this.suggestionError.set('');
  }

  closeSuggestion() {
    this.suggestionOpen.set(false);
    this.suggestionCreature.set(null);
  }

  updateSuggestionValue(type: ResistanceType, value: string) {
    this.suggestionValues.update(values => ({ ...values, [type]: value }));
  }

  submitSuggestion() {
    const creature = this.suggestionCreature() as (Creature & { id?: string }) | null;
    const creatureName = (creature?.nome || this.suggestionName()).trim();

    if (!creatureName) {
      this.suggestionError.set('Inserisci il nome della creatura.');
      return;
    }

    const values = Object.fromEntries(
      Object.entries(this.suggestionValues())
        .map(([type, value]) => [type, normalizeResistanceText(value)] as const)
        .filter(([, value]) => value && value !== '-')
    ) as Partial<Record<ResistanceType, string>> & { __dungeon?: string };

    if (!Object.keys(values).length) {
      this.suggestionError.set('Inserisci almeno una resistenza.');
      return;
    }

    const dungeon = this.suggestionDungeon().trim();
    if (!creature && dungeon) values.__dungeon = dungeon;

    this.suggestionSaving.set(true);
    this.suggestionError.set('');
    this.suggestionService.create({
      creature_id: creature?.id || '__new__',
      creature_nome: creatureName,
      values,
      note: this.suggestionNote(),
      status: 'open',
    }).subscribe({
      next: () => {
        this.suggestionSaving.set(false);
        this.suggestionMessage.set('Suggerimento inviato agli admin.');
      },
      error: error => {
        this.suggestionSaving.set(false);
        this.suggestionError.set(error?.error?.message || error?.message || 'Impossibile inviare il suggerimento.');
      },
    });
  }

  cellClasses(value: string, type: ResistanceType) {
    return this.resistanceClass(value) + ' el-' + type.toLowerCase();
  }

  resistanceClass(value: string) {
    const normalized = value.toLowerCase();
    if (normalized.includes('immune')) return 'immune';
    if (normalized.includes('-') || normalized.includes('−')) return 'weak';
    const numeric = Number(normalizeResistanceText(normalized));
    if (!Number.isNaN(numeric) && numeric > 0) return 'strong';
    return '';
  }

  armorRecommendation(group: DungeonGroup) {
    return DUNGEON_ARMOR_RECOMMENDATIONS[group.dungeon] || '';
  }

  dungeonLabel(creature: Creature) {
    return this.creatureService.dungeonLabel(creature);
  }

  bestGroupDamageElement(group: DungeonGroup) {
    const averages = this.resistanceTypes
      .map(type => {
        const weightedValues = group.creatures
          .map(creature => {
            const value = this.numericResistance(this.resistanceValue(creature, type));
            if (value === null) return null;
            return {
              value,
              weight: this.damageWeight(creature),
            };
          })
          .filter((item): item is { value: number; weight: number } => item !== null);

        if (!weightedValues.length) return null;

        const weightSum = weightedValues.reduce((sum, item) => sum + item.weight, 0);
        const weightedAverage = weightedValues.reduce((sum, item) => sum + item.value * item.weight, 0) / weightSum;

        return {
          type,
          value: weightedAverage,
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
      Male: ['Malefico', 'Male'],
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
      Male: 'malefico',
      Magia: 'magia',
    };

    return creature[keys[type]] as string | undefined;
  }

  private numericResistance(value: string) {
    const normalized = value.replace('−', '-').replace('%', '').trim();
    if (!normalized || normalized === '-') return null;
    if (normalized.toLowerCase().includes('immune')) return 100;

    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? null : numeric;
  }

  private damageWeight(creature: Creature) {
    return DAMAGE_WEIGHT_BY_TYPE[creature.tipo] || 1;
  }

  private formatResistance(value: number) {
    return `${value}%`;
  }
}

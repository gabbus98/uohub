import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ARTICLES } from '../data/articles.data';
import { CreatureService } from './creature.service';
import { DungeonService } from './dungeon.service';
import { AuthService } from './auth.service';
import { Article, Creature, SearchResult } from '../models/article.model';
import { Dungeon } from '../models/dungeon.model';

export interface SidebarItem {
  id: string;
  icon: string;
  label: string;
  guild?: boolean;
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

@Injectable({ providedIn: 'root' })
export class WikiService {
  private _currentId = signal<string>('home');
  currentArticleId = this._currentId.asReadonly();

  bestiaryFilter = signal('');

  currentArticle = computed<Article | undefined>(() => ARTICLES[this._currentId()]);

  private searchIndex: (SearchResult & { text: string })[] = [];
  private bestiaryBaseText = '';
  private dungeonBaseText = '';

  private auth = inject(AuthService);

  sidebarSections = computed<SidebarSection[]>(() => {
    const sections: SidebarSection[] = [
      {
        label: 'Generale',
        items: [{ id: 'changelog', icon: '📋', label: 'Changelog Shard' }]
      },
      {
        label: 'Meccaniche',
        items: [
          { id: 'skills', icon: '⚙', label: 'Sistema Skill' },
          { id: 'crafting', icon: '🔨', label: 'Crafting' },
          { id: 'materiali', icon: '🪵', label: 'Materiali' },
          { id: 'archi-balestre', icon: '🏹', label: 'Archi & Balestre' }
        ]
      },
      {
        label: 'Bestiario',
        items: [{ id: 'bestiario', icon: '📖', label: 'Bestiario' }]
      },
      {
        label: 'Luoghi',
        items: [{ id: 'dungeon', icon: '💀', label: 'Dungeon' }]
      },
      {
        label: 'Tool',
        items: [
          { id: 'tool-skill-calc', icon: '🧮', label: 'Skill Calculator' },
          { id: 'tool-bb-split', icon: '✂️', label: 'Formattatore Bacheca' },
          { id: 'tool-enchant-cost', icon: '✨', label: 'Costo Incantamento' },
          { id: 'tool-armor-cost', icon: '🛡️', label: 'Armature Infuse' },
          { id: 'tool-party-advisor', icon: '🧭', label: 'Party Advisor' },
          { id: 'tool-character-sheet', icon: 'PG', label: 'Scheda Personaggio' },
          { id: 'tool-run-log', icon: 'RL', label: 'Registro Run' },
        ]
      },
    ];
    if (this.auth.isAdmin()) {
      sections.push({
        label: 'Admin',
        items: [
          { id: 'admin-bestiario', icon: '⚙', label: 'Gestione Creature' },
          { id: 'admin-dungeon', icon: '💀', label: 'Gestione Dungeon' },
          { id: 'admin-utenti', icon: '👥', label: 'Gestione Utenti' },
          { id: 'admin-db', icon: '🗄', label: 'Gestione Database' },
        ]
      });
    }
    return sections;
  });

  constructor() {
    this.searchIndex = Object.entries(ARTICLES)
      .filter(([, art]) => !art.guild)
      .map(([id, art]) => ({
        id,
        title: art.title,
        cat: art.cat || '',
        desc: art.desc || '',
        text: (
          art.title + ' ' +
          (art.desc || '') + ' ' +
          (art.cat || '') + ' ' +
          art.body.replace(/<[^>]+>/g, ' ')
        ).toLowerCase()
      }));

    const bestiaryEntry = this.searchIndex.find(item => item.id === 'bestiario');
    if (bestiaryEntry) {
      this.bestiaryBaseText = bestiaryEntry.text;
    }
    const dungeonEntry = this.searchIndex.find(item => item.id === 'dungeon');
    if (dungeonEntry) {
      this.dungeonBaseText = dungeonEntry.text;
    }

    const creatureService = inject(CreatureService);
    const dungeonService = inject(DungeonService);
    effect(() => {
      const creatures = creatureService.creatures();
      const bestiaryEntry = this.searchIndex.find(item => item.id === 'bestiario');
      if (bestiaryEntry) {
        bestiaryEntry.text = this.bestiaryBaseText + ' ' + this.buildCreatureText(creatures);
      }

      const dungeons = dungeonService.dungeons();
      const dungeonEntry = this.searchIndex.find(item => item.id === 'dungeon');
      if (dungeonEntry) {
        dungeonEntry.text = this.dungeonBaseText + ' ' + this.buildDungeonText(dungeons, creatures, creatureService);
      }
    });
  }

  private buildCreatureText(creatures: Creature[]) {
    return creatures
      .map(c => [
        c.nome, c.tipo, c.dungeons?.join(' ') || c.dungeon, c.danno, c.hp,
        c.fuoco, c.freddo, c.energia, c.veleno,
        c.psionico, c.sacro, c.malefico, c.magia,
        c.drop, c.strategia,
      ].filter(Boolean).join(' '))
      .join(' ')
      .toLowerCase();
  }

  private buildDungeonText(
    dungeons: Dungeon[],
    creatures: Creature[],
    creatureService: CreatureService
  ) {
    return dungeons
      .map(dungeon => {
        const dungeonCreatures = creatures
          .filter(creature => creatureService.isInDungeon(creature, dungeon.nome))
          .map(creature => [
            creature.nome,
            creature.tipo,
            creature.drop,
            creature.strategia,
          ].filter(Boolean).join(' '));

        return [
          dungeon.nome,
          dungeon.descrizione,
          dungeon.posizione_mappa,
          dungeon.protezione_elementale,
          dungeon.note,
          ...dungeonCreatures,
        ].filter(Boolean).join(' ');
      })
      .join(' ')
      .toLowerCase();
  }

  navigate(id: string) {
    const adminPages = ['admin-bestiario', 'admin-utenti', 'admin-dungeon', 'admin-db'];
    if (!adminPages.includes(id) && !ARTICLES[id]) return;
    if (id !== 'bestiario') this.bestiaryFilter.set('');
    this._currentId.set(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToBestiaryFor(dungeonNome: string) {
    this.bestiaryFilter.set(dungeonNome);
    this.navigate('bestiario');
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];
    const keywords = query.toLowerCase().split(/\s+/);
    return this.searchIndex
      .filter(item => keywords.every(k => item.text.includes(k)))
      .slice(0, 7);
  }

}

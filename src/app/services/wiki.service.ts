import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { ARTICLES } from '../data/articles.data';
import { CreatureService } from './creature.service';
import { AuthService } from './auth.service';
import { Article, Creature, SearchResult } from '../models/article.model';

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

  currentArticle = computed<Article | undefined>(() => ARTICLES[this._currentId()]);

  private searchIndex: (SearchResult & { text: string })[] = [];
  private bestiaryBaseText = '';

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
          { id: 'tool-armor-cost', icon: '🛡️', label: 'Armature Infuse' }
        ]
      },
    ];
    if (this.auth.isAdmin()) {
      sections.push({
        label: 'Admin',
        items: [
          { id: 'admin-bestiario', icon: '⚙', label: 'Gestione Creature' },
          { id: 'admin-utenti', icon: '👥', label: 'Gestione Utenti' },
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

    const creatureService = inject(CreatureService);
    effect(() => {
      const creatures = creatureService.creatures();
      if (!creatures.length) return;
      const bestiaryEntry = this.searchIndex.find(item => item.id === 'bestiario');
      if (!bestiaryEntry) return;
      bestiaryEntry.text = this.bestiaryBaseText + ' ' + this.buildCreatureText(creatures);
    });
  }

  private buildCreatureText(creatures: Creature[]) {
    return creatures
      .map(c => [
        c.nome, c.tipo, c.dungeon, c.danno, c.hp,
        c.fuoco, c.freddo, c.energia, c.veleno,
        c.psionico, c.sacro, c.malefico, c.magia,
        c.drop, c.strategia,
      ].filter(Boolean).join(' '))
      .join(' ')
      .toLowerCase();
  }

  navigate(id: string) {
    if (id !== 'admin-bestiario' && id !== 'admin-utenti' && !ARTICLES[id]) return;
    this._currentId.set(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];
    const keywords = query.toLowerCase().split(/\s+/);
    return this.searchIndex
      .filter(item => keywords.every(k => item.text.includes(k)))
      .slice(0, 7);
  }

}

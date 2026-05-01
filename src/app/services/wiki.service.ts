import { Injectable, signal, computed } from '@angular/core';
import { ARTICLES } from '../data/articles.data';
import { Article, SearchResult } from '../models/article.model';

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
  }

  navigate(id: string) {
    if (!ARTICLES[id]) return;
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

  sidebarSections(): SidebarSection[] {
    return [
      {
        label: 'Generale',
        items: [
          { id: 'changelog', icon: '📋', label: 'Changelog Shard' }
        ]
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
        items: [
          { id: 'bestiario', icon: '📖', label: 'Bestiario' }
        ]
      },
      {
        label: 'Luoghi',
        items: [
          { id: 'dungeon', icon: '💀', label: 'Dungeon' }
        ]
      },
      {
        label: 'Tool',
        items: [
          { id: 'tool-skill-calc', icon: '🧮', label: 'Skill Calculator' },
          { id: 'tool-bb-split', icon: '✂️', label: 'Formattatore Bacheca' },
          { id: 'tool-enchant-cost', icon: '✨', label: 'Costo Incantamento' }
        ]
      }
    ];
  }
}

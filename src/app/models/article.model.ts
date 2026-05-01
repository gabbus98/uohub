export interface ArticleTag {
  t: string;
  cls?: string;
}

export interface TocItem {
  id: string;
  label: string;
}

export interface Article {
  cat?: string;
  title: string;
  desc?: string;
  eyebrow?: string;
  tags?: ArticleTag[];
  toc?: TocItem[];
  body: string;
  prev?: { id: string; title: string };
  next?: { id: string; title: string };
  guild?: boolean;
}

export interface Creature {
  nome: string;
  tipo: 'comune' | 'raro' | 'boss';
  icona: string;
  dungeon: string;
  hp: string;
  danno: string;
  habitat: string;
  drop: string;
  strategia: string;
  resistenze: string;
}

export interface SearchResult {
  id: string;
  title: string;
  cat: string;
  desc: string;
}

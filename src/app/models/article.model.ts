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
  tipo: 'comune' | 'non-comune' | 'raro' | 'boss' | 'tamabile';
  tags?: CreatureTag[];
  tamabile?: boolean;
  icona: string;
  dungeon: string;
  hp: string;
  danno: string;
  salute?: string;
  stamina?: string;
  mana?: string;
  str?: string;
  dex?: string;
  int?: string;
  ar?: string;
  fuoco?: string;
  freddo?: string;
  energia?: string;
  veleno?: string;
  psionico?: string;
  sacro?: string;
  malefico?: string;
  magia?: string;
  drop?: string;
  strategia?: string;
  resistenze?: string | Partial<Record<ResistanceType, string>>;
}

export type ResistanceType =
  | 'Fuoco'
  | 'Freddo'
  | 'Energia'
  | 'Veleno'
  | 'Psionico'
  | 'Sacro'
  | 'Malefico'
  | 'Magia';

export type CreatureTag = 'tamabile';

export interface SearchResult {
  id: string;
  title: string;
  cat: string;
  desc: string;
}

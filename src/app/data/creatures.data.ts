import { Creature, ResistanceType } from '../models/article.model';

const RES_ORDER: ResistanceType[] = [
  'Fuoco',
  'Freddo',
  'Energia',
  'Veleno',
  'Psionico',
  'Sacro',
  'Malefico',
  'Magia',
];

export function res(...values: string[]) {
  return RES_ORDER.reduce<Partial<Record<ResistanceType, string>>>((acc, type, index) => {
    const value = values[index];
    if (value && value !== '-') acc[type] = value;
    return acc;
  }, {});
}

export function resMap(values: Partial<Record<ResistanceType, string>>) {
  return values;
}

export const DUNGEON_ARMOR_RECOMMENDATIONS: Record<string, string> = {
  'Fortezza Deva': 'Sacro',
};

export const CREATURES: Creature[] = [
  {
    nome: 'Cacciatore del profondo', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '-40%',
    freddo: '30%',
    energia: '-50%',
    veleno: '0%',
    psionico: '0%',
    sacro: '60%',
    malefico: '-50%',
    magia: '20%',
  },
  {
    nome: 'Emissario', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '20%',
    freddo: '20%',
    energia: '20%',
    veleno: '0%',
    psionico: '50%',
    sacro: '70%',
    malefico: '-50%',
    magia: '30%',
  },
  {
    nome: 'Spadaccino misterioso', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '30%',
    freddo: '20%',
    energia: '20%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-30%',
    magia: '30%',
  },
  {
    nome: 'Luogotenente', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '0%',
    freddo: '0%',
    energia: '0%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-70%',
    magia: '50%',
  },
  {
    nome: 'Luogotenente splendente', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '0%',
    freddo: '0%',
    energia: '0%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-70%',
    magia: '50%',
  },
  {
    nome: 'Arciere lucente', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '0%',
    freddo: '0%',
    energia: '0%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-70%',
    magia: '50%',
  },
  {
    nome: 'Antico Campione', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '0%',
    freddo: '0%',
    energia: '0%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-70%',
    magia: '50%',
  },
  {
    nome: 'Fante corazzato', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '0%',
    freddo: '0%',
    energia: '0%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-70%',
    magia: '50%',
  },
  {
    nome: 'Fante corazzato V.2', tipo: 'comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '', danno: '', 
    fuoco: '30%',
    freddo: '30%',
    energia: '20%',
    veleno: '50%',
    psionico: '0%',
    sacro: '70%',
    malefico: '-50%',
    magia: '30%',
  },
  {
    nome: 'Persecutore Ardente', tipo: 'non-comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '80%',
    freddo: '-50%',
    energia: '20%',
    veleno: '0%',
    psionico: '0%',
    sacro: '60%',
    malefico: '-50%',
    magia: '10%',
  },
  {
    nome: 'Camminatore delle nubi', tipo: 'non-comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '-30%',
    freddo: '-50%',
    energia: '20%',
    veleno: '0%',
    psionico: '0%',
    sacro: '60%',
    malefico: '-50%',
    magia: '20%',
  },
  {
    nome: 'Dama misteriosa', tipo: 'non-comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '120', danno: '15–25', 
    fuoco: '20%',
    freddo: '20%',
    energia: '20%',
    veleno: '0%',
    psionico: '60%',
    sacro: '60%',
    malefico: '-50%',
    magia: '50%',
  },
  {
    nome: 'Alfiere delle nebbie', tipo: 'non-comune', icona: '', dungeon: 'Fortezza Deva',
    hp: '', danno: '', 
    fuoco: '10%',
    freddo: '30%',
    energia: '-10%',
    veleno: '0%',
    psionico: '10%',
    sacro: '60%',
    malefico: '-50%',
    magia: '20%',
  },
  {
    nome: 'Cuore della tempesta', tipo: 'boss', icona: '', dungeon: 'Fortezza Deva',
    hp: '', danno: '',
    ar: '', 
    fuoco: '-20%',
    freddo: '50%',
    energia: '100%',
    veleno: '0%',
    psionico: '0%',
    sacro: '80%',
    malefico: '-50%',
    magia: '20%',
  },
  {
    nome: 'Generale splendente', tipo: 'boss', icona: '', dungeon: 'Fortezza Deva',
    hp: '22000', danno: '',
    ar: '25', 
    fuoco: '20%',
    freddo: '20%',
    energia: '20%',
    veleno: '40%',
    psionico: '50%',
    sacro: '60%',
    malefico: '-20%',
    magia: '30%',
  },
  {
    nome: 'Sfinge', tipo: 'comune', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25',
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Sfinge dorata', tipo: 'comune', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25', 
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Serpe Dorata', tipo: 'raro', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25', 
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Cavaliere Ophidiano', tipo: 'comune', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25', 
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Arcimago Ophidiano', tipo: 'comune', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25', 
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Matriarca Ophidiana', tipo: 'comune', icona: '', dungeon: 'Piramide Ophidiana | Deserto di Tremec',
    hp: '120', danno: '15–25', 
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Incubo', tipo: 'raro', icona: '', dungeon: 'Albero degli impiccati',
    hp: '120', danno: '15–25', 
    fuoco: '50%',
    freddo: '20%',
    energia: '20%',
    veleno: '50%',
    psionico: '30%',
    sacro: '-100%',
    malefico: '50%',
    magia: '0%',
    str: '160', dex: '100', int: '80', salute: '299', stamina: '106', mana: '287'
  },
  {
    nome: 'Incubo', tipo: 'raro', icona: '', dungeon: 'Kur\'n ghul | 3 Livello',
    hp: '120', danno: '15–25', 
    resistenze: 'Fuoco +50%, Freddo +20%, Energia +20%, Veleno +50%, Psionico +30%, Sacro -100%, Malefico +50%, Magia +0%',
    str: '160', dex: '100', int: '80', salute: '299', stamina: '106', mana: '287'
  },
  {
    nome: 'Serpe Argentata', tipo: 'raro', icona: '', dungeon: '',
    hp: '120', danno: '15–25', 
    resistenze: 'Fuoco +50%, Freddo +20%, Energia +20%, Veleno +50%, Psionico +30%, Sacro -100%, Malefico +50%, Magia +0%',
  }
];

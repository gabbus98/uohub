import { Creature } from '../models/article.model';

export const CREATURES: Creature[] = [
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
    nome: 'Incubo', tipo: 'raro', icona: '', dungeon: 'Albero degli impiccati',
    hp: '120', danno: '15–25', 
    resistenze: 'Fuoco +50%, Freddo +20%, Energia +20%, Veleno +50%, Psionico +30%, Sacro -100%, Malefico +50%, Magia +0%',
    str: '160', dex: '100', int: '80', salute: '299', stamina: '106', mana: '287'
  },
  {
    nome: 'Incubo', tipo: 'raro', icona: '', dungeon: 'Kur\'n ghul | 3 Livello',
    hp: '120', danno: '15–25', 
    resistenze: 'Fuoco +50%, Freddo +20%, Energia +20%, Veleno +50%, Psionico +30%, Sacro -100%, Malefico +50%, Magia +0%',
    str: '160', dex: '100', int: '80', salute: '299', stamina: '106', mana: '287'
  }
];

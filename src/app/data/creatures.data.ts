import { Creature } from '../models/article.model';

export const CREATURES: Creature[] = [
  {
    nome: 'Lupo delle Nevi', tipo: 'comune', icona: '🐺', dungeon: 'Montagne di Karath',
    hp: '120', danno: '15–25', habitat: 'Montagne Karath',
    drop: 'Pelliccia Bianca, Zanna di Lupo',
    strategia: 'Si muove in branco. Eliminare prima i cuccioli.',
    resistenze: 'Freddo +50%, Fuoco −30%'
  },
  {
    nome: 'Ragno Velenoso', tipo: 'comune', icona: '🕷️', dungeon: 'Paludi di Moren',
    hp: '80', danno: '10–18', habitat: 'Paludi di Moren',
    drop: 'Veleno Grezzo, Seta di Ragno',
    strategia: 'Infligge veleno. Tenere scorte di antidoto.',
    resistenze: 'Veleno Immune'
  },
  {
    nome: 'Orso Antico', tipo: 'raro', icona: '🐻', dungeon: 'Foresta di Vethgar',
    hp: '380', danno: '40–65', habitat: 'Foresta di Vethgar',
    drop: '★ Pelliccia Dorata, Artiglio Antico, Grasso d\'Orso',
    strategia: 'A metà HP esegue una carica devastante. Evitare la linea diretta.',
    resistenze: 'Fisico +20%'
  },
  {
    nome: 'Fenice di Cenere', tipo: 'raro', icona: '🔥', dungeon: 'Pianure Ardenti',
    hp: '520', danno: '55–80', habitat: 'Pianure Ardenti',
    drop: '★★ Piuma di Fenice, Cuore Ardente',
    strategia: 'Risorge una volta al 30% HP se non si usa veleno sul colpo finale.',
    resistenze: 'Fuoco Immune, Freddo −60%'
  },
  {
    nome: 'Golem di Pietra', tipo: 'comune', icona: '🪨', dungeon: 'Miniera Abbandonata',
    hp: '250', danno: '30–45', habitat: 'Miniera Abbandonata',
    drop: 'Frammento di Pietra Viva, Minerale Antico',
    strategia: 'Lento ma resistente. Usare armi da punta o magie.',
    resistenze: 'Fisico +70%, Fuoco +20%'
  },
  {
    nome: 'Elementale di Terra', tipo: 'raro', icona: '⛰️', dungeon: 'Miniera Abbandonata',
    hp: '430', danno: '50–70', habitat: 'Miniera Abbandonata — Livello 2',
    drop: '★ Cristallo di Terra, Nucleo Elementale',
    strategia: 'Immune ai danni fisici normali. Usare armi magiche o Magery.',
    resistenze: 'Fisico Immune, Energia −40%'
  },
  {
    nome: 'Scheletro Guerriero', tipo: 'comune', icona: '💀', dungeon: 'Cripta di Solveth',
    hp: '110', danno: '12–22', habitat: 'Cripta di Solveth',
    drop: 'Ossa Antiche, Frammento di Armatura',
    strategia: 'Nessuna meccanica speciale. Vulnerabile alla luce (Spirit Speak).',
    resistenze: 'Veleno Immune, Freddo +30%'
  },
  {
    nome: 'Revenant', tipo: 'raro', icona: '👻', dungeon: 'Cripta di Solveth',
    hp: '350', danno: '38–58', habitat: 'Cripta di Solveth — Ala Est',
    drop: '★ Essenza Spettrale, Sudario di Solveth',
    strategia: 'Attraversa le pareti. Usare Spirit Speak per rallentarlo.',
    resistenze: 'Fisico +60%, Energia −50%'
  },
  {
    nome: 'Predatore Alato', tipo: 'comune', icona: '🦇', dungeon: 'Caverne dell\'Agonia',
    hp: '180', danno: '22–35', habitat: 'Caverne dell\'Agonia — Livello 1',
    drop: 'Artiglio Minore, Pelliccia Scura',
    strategia: 'Attacca in gruppo. Mantenere la schiena al muro.',
    resistenze: 'Nessuna particolare'
  },
  {
    nome: 'Cacciatore Alpha', tipo: 'raro', icona: '🐆', dungeon: 'Caverne dell\'Agonia',
    hp: '600', danno: '70–100', habitat: 'Caverne dell\'Agonia — Livello 2',
    drop: '★★ Pelle del Predatore Antico, Zanna Nera',
    strategia: 'Segna un bersaglio casuale ogni 20s infliggendo danno extra. Ruotare il tank.',
    resistenze: 'Fisico +30%, Veleno +20%'
  },
  {
    nome: 'Dragonetto di Varroth', tipo: 'comune', icona: '🐲', dungeon: 'Abisso di Varroth',
    hp: '300', danno: '40–60', habitat: 'Abisso di Varroth',
    drop: 'Scaglietta, Sangue di Drago',
    strategia: 'Evocati da Varroth in Fase 2. Eliminarli entro 60s o si fondono col boss.',
    resistenze: 'Fuoco +50%'
  },
  {
    nome: 'Varroth l\'Eterno', tipo: 'boss', icona: '🐉', dungeon: 'Abisso di Varroth',
    hp: '8.000', danno: '150–280', habitat: 'Abisso di Varroth — Camera del Trono',
    drop: '★★★ Artiglio di Varroth, Scaglia Antica, Spirito del Predatore',
    strategia: 'Fase 3: immunità al veleno rimossa. Minimo 6 giocatori. Healer dedicato.',
    resistenze: 'Fisico +40%, Magia +60%, *Veleno Fase 3'
  }
];

export const DUNGEON_ORDER = [
  'Montagne di Karath',
  'Foresta di Vethgar',
  'Pianure Ardenti',
  'Paludi di Moren',
  'Miniera Abbandonata',
  'Cripta di Solveth',
  'Caverne dell\'Agonia',
  'Abisso di Varroth'
];

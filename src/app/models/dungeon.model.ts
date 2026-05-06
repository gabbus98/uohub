export interface BauleDungeon {
  lucchetti: number; // 1-5: 1=reward molto bassa, 5=reward molto alta
}

export interface PelleDungeon {
  nome: string;
  quantita: number;
}

export interface PartecipanteRun {
  nome: string;
  classe: string;
}

export interface Dungeon {
  nome: string;
  descrizione?: string;
  difficolta: number; // 1-5 stelle
  bauli: BauleDungeon[];
  posizione_mappa?: string;
  screenshot?: string;
  protezione_elementale?: string;
  note?: string;
}

export interface DungeonRecord extends Dungeon {
  id: string;
}

export interface DungeonRun {
  dungeon_nome: string;
  monete: number;
  pelli: PelleDungeon[];
  tempo: number; // minuti
  pg_count: number;
  partecipanti: PartecipanteRun[];
  data: string; // ISO date string
}

export interface DungeonRunRecord extends DungeonRun {
  id: string;
  created?: string;
}

export interface RunStats {
  count: number;
  avg_monete: number;
  avg_tempo: number;
  avg_pg: number;
  pelli: { nome: string; avg: number; total: number }[];
}

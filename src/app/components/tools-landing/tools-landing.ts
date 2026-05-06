import { Component, inject } from '@angular/core';
import { WikiService } from '../../services/wiki.service';

@Component({
  selector: 'app-tools-landing',
  templateUrl: './tools-landing.html'
})
export class ToolsLandingComponent {
  wiki = inject(WikiService);

  tools = [
    { id: 'tool-skill-calc', icon: 'SK', title: 'Skill Calculator', desc: 'Pianifica la tua build: somma le skill e controlla il cap da 700 punti.' },
    { id: 'tool-bb-split', icon: 'BB', title: 'Formattatore per Bacheca', desc: 'Spezza un testo lungo in piu post da bacheca rispettando i limiti di peso UO.' },
    { id: 'tool-enchant-cost', icon: 'EN', title: 'Costo Incantamento', desc: 'Calcola materiali e componenti per rune maggiori e minori.' },
    { id: 'tool-armor-cost', icon: 'AR', title: 'Armature Infuse', desc: 'Calcola lingotti, sangue e bonus per armature metalliche infuse.' },
    { id: 'tool-character-sheet', icon: 'PG', title: 'Scheda Personaggio', desc: 'Salva identita, stat, skill e note direttamente sul tuo account.' },
    { id: 'tool-run-log', icon: 'RL', title: 'Registro Run', desc: 'Registra run di gilda, loot, tempi e partecipanti.' },
  ];
}

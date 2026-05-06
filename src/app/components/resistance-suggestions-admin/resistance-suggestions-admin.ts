import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CreatureService } from '../../services/creature.service';
import { normalizeResistanceText, ResistanceSuggestionRecord, ResistanceSuggestionService } from '../../services/resistance-suggestion.service';
import { ResistanceType } from '../../models/article.model';

const RESISTANCE_KEYS: Record<ResistanceType, string> = {
  Fuoco: 'fuoco',
  Freddo: 'freddo',
  Energia: 'energia',
  Veleno: 'veleno',
  Psionico: 'psionico',
  Sacro: 'sacro',
  Male: 'malefico',
  Magia: 'magia',
};

@Component({
  selector: 'app-resistance-suggestions-admin',
  templateUrl: './resistance-suggestions-admin.html',
})
export class ResistanceSuggestionsAdminComponent {
  suggestions = inject(ResistanceSuggestionService);
  creatures = inject(CreatureService);
  auth = inject(AuthService);

  resistanceTypes: ResistanceType[] = ['Fuoco', 'Freddo', 'Energia', 'Veleno', 'Psionico', 'Sacro', 'Male', 'Magia'];
  openSuggestions = computed(() => this.suggestions.suggestions().filter(item => item.status !== 'accepted' && item.status !== 'closed'));
  closedSuggestions = computed(() => this.suggestions.suggestions().filter(item => item.status === 'accepted' || item.status === 'closed'));

  constructor() {
    this.reload();
  }

  reload() {
    this.suggestions.load(this.auth.token());
  }

  isNewCreature(suggestion: ResistanceSuggestionRecord) {
    return suggestion.creature_id === '__new__';
  }

  suggestionDungeon(suggestion: ResistanceSuggestionRecord) {
    return (suggestion.values as Record<string, string>)['__dungeon'] || '';
  }

  accept(suggestion: ResistanceSuggestionRecord) {
    const token = this.auth.token();
    if (!token) return;
    const payload = this.resistanceTypes.reduce<Record<string, string>>((acc, type) => {
      const value = normalizeResistanceText(suggestion.values[type]);
      if (value) acc[RESISTANCE_KEYS[type]] = value;
      return acc;
    }, {});

    const request = this.isNewCreature(suggestion)
      ? this.creatures.create({
          nome: suggestion.creature_nome,
          tipo: 'comune',
          icona: 'M',
          dungeon: this.suggestionDungeon(suggestion),
          dungeons: this.suggestionDungeon(suggestion) ? [this.suggestionDungeon(suggestion)] : [],
          hp: '-',
          danno: '-',
          ...payload,
        } as any, token)
      : this.creatures.update(suggestion.creature_id, payload as any, token);

    request.subscribe({
      next: () => {
        this.suggestions.updateStatus(suggestion.id, 'accepted', token).subscribe(() => {
          this.creatures.load();
          this.reload();
        });
      },
    });
  }

  close(suggestion: ResistanceSuggestionRecord) {
    const token = this.auth.token();
    if (!token) return;
    this.suggestions.updateStatus(suggestion.id, 'closed', token).subscribe(() => this.reload());
  }

  delete(suggestion: ResistanceSuggestionRecord) {
    const token = this.auth.token();
    if (!token) return;
    this.suggestions.delete(suggestion.id, token).subscribe(() => this.reload());
  }
}

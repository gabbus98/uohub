import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatureService, CreatureRecord } from '../../services/creature.service';
import { AuthService } from '../../services/auth.service';
import { Creature } from '../../models/article.model';

const EMPTY_FORM = (): Partial<Creature> => ({
  nome: '', tipo: 'comune', icona: '', dungeon: '', dungeons: [],
  hp: '', danno: '', ar: '',
  str: '', dex: '', int: '',
  salute: '', stamina: '', mana: '',
  fuoco: '', freddo: '', energia: '', veleno: '',
  psionico: '', sacro: '', malefico: '', magia: '',
  drop: '', strategia: '',
  tamabile: false,
});

@Component({
  selector: 'app-creature-admin',
  imports: [FormsModule],
  templateUrl: './creature-admin.html',
})
export class CreatureAdminComponent {
  cs = inject(CreatureService);
  auth = inject(AuthService);

  editing = signal<CreatureRecord | null>(null);
  showForm = signal(false);
  form = signal<Partial<Creature>>(EMPTY_FORM());
  saving = signal(false);
  confirmDelete = signal<string | null>(null);
  saveError = signal('');
  deleteError = signal('');
  searchQuery = signal('');
  typeFilter = signal<Creature['tipo'] | 'all'>('all');

  tipi: Creature['tipo'][] = ['comune', 'non-comune', 'raro', 'boss', 'tamabile'];

  filteredCreatures = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const type = this.typeFilter();

    return this.cs.creatures().filter(creature => {
      const matchesType = type === 'all' || creature.tipo === type;
      const text = [
        creature.nome,
        creature.tipo,
        this.dungeonLabel(creature),
        creature.drop,
        creature.strategia,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesType && (!query || text.includes(query));
    });
  });

  openNew() {
    this.editing.set(null);
    this.form.set(EMPTY_FORM());
    this.showForm.set(true);
  }

  openEdit(c: CreatureRecord) {
    this.editing.set(c);
    this.form.set({ ...c, dungeons: this.cs.creatureDungeons(c) });
    this.showForm.set(true);
  }

  cancel() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  save() {
    const token = this.auth.token();
    if (!token) return;
    this.saving.set(true);
    this.saveError.set('');

    const data = this.form();
    const existing = this.editing();
    const op = existing
      ? this.cs.update(existing.id, data, token)
      : this.cs.create(data, token);

    op.subscribe({
      next: () => {
        this.cs.load();
        this.cancel();
        this.saving.set(false);
      },
      error: (error) => {
        this.saveError.set(this.formatError(error, 'Impossibile salvare la creatura.'));
        this.saving.set(false);
      },
    });
  }

  askDelete(id: string) {
    this.deleteError.set('');
    this.confirmDelete.set(id);
  }

  doDelete() {
    const id = this.confirmDelete();
    const token = this.auth.token();
    if (!id || !token) return;
    this.deleteError.set('');
    this.cs.delete(id, token).subscribe({
      next: () => {
        this.cs.load();
        this.confirmDelete.set(null);
      },
      error: (error) => {
        this.deleteError.set(this.formatError(error, 'Impossibile eliminare la creatura.'));
      },
    });
  }

  updateField(key: keyof Creature, value: unknown) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  updateDungeons(value: string) {
    const dungeons = value.split(/[,;\n]/).map(d => d.trim()).filter(Boolean);
    this.form.update(f => ({ ...f, dungeons, dungeon: dungeons.join(', ') }));
  }

  dungeonText(creature: Partial<Creature>) {
    return this.cs.creatureDungeons(creature).join('\n');
  }

  dungeonLabel(creature: Partial<Creature>) {
    return this.cs.dungeonLabel(creature);
  }

  private formatError(error: any, fallback: string) {
    const data = error?.error?.data;
    if (data && Object.keys(data).length) {
      return `${fallback} ${JSON.stringify(data)}`;
    }
    return error?.error?.message || error?.message || fallback;
  }
}

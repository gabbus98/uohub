import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatureService, CreatureRecord } from '../../services/creature.service';
import { AuthService } from '../../services/auth.service';
import { Creature } from '../../models/article.model';

const EMPTY_FORM = (): Partial<Creature> => ({
  nome: '', tipo: 'comune', icona: '', dungeon: '',
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

  tipi: Creature['tipo'][] = ['comune', 'non-comune', 'raro', 'boss', 'tamabile'];

  openNew() {
    this.editing.set(null);
    this.form.set(EMPTY_FORM());
    this.showForm.set(true);
  }

  openEdit(c: CreatureRecord) {
    this.editing.set(c);
    this.form.set({ ...c });
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
      error: () => this.saving.set(false),
    });
  }

  askDelete(id: string) {
    this.confirmDelete.set(id);
  }

  doDelete() {
    const id = this.confirmDelete();
    const token = this.auth.token();
    if (!id || !token) return;
    this.cs.delete(id, token).subscribe(() => {
      this.cs.load();
      this.confirmDelete.set(null);
    });
  }

  updateField(key: keyof Creature, value: unknown) {
    this.form.update(f => ({ ...f, [key]: value }));
  }
}

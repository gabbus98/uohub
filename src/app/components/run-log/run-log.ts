import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DungeonService } from '../../services/dungeon.service';
import { DungeonRun, DungeonRunRecord } from '../../models/dungeon.model';

const EMPTY_RUN = (): Partial<DungeonRun> => ({
  dungeon_nome: '',
  monete: 0,
  pelli: [],
  tempo: 0,
  pg_count: 1,
  partecipanti: [],
  data: new Date().toISOString().split('T')[0],
  note: '',
});

@Component({
  selector: 'app-run-log',
  imports: [FormsModule],
  templateUrl: './run-log.html',
})
export class RunLogComponent {
  ds = inject(DungeonService);
  auth = inject(AuthService);

  form = signal<Partial<DungeonRun>>(EMPTY_RUN());
  saving = signal(false);
  error = signal('');
  saved = signal(false);
  confirmDelete = signal<string | null>(null);

  knownClasses = computed(() => this.ds.uniqueClasses());
  recentRuns = computed(() => [...this.ds.runs()].slice(0, 30));

  canDelete(run: DungeonRunRecord) {
    const user = this.auth.currentUser();
    if (!user) return false;
    return user.username === 'gabbadmin' || run.user_id === user.id;
  }

  updateField(key: keyof DungeonRun, value: unknown) {
    this.form.update(form => ({ ...form, [key]: value }));
    this.saved.set(false);
  }

  addPella() {
    this.form.update(form => ({
      ...form,
      pelli: [...(form.pelli || []), { nome: '', quantita: 1 }],
    }));
  }

  removePella(index: number) {
    this.form.update(form => ({
      ...form,
      pelli: (form.pelli || []).filter((_, i) => i !== index),
    }));
  }

  updatePella(index: number, key: 'nome' | 'quantita', value: string | number) {
    this.form.update(form => {
      const pelli = [...(form.pelli || [])];
      pelli[index] = { ...pelli[index], [key]: value };
      return { ...form, pelli };
    });
  }

  addPartecipante() {
    this.form.update(form => ({
      ...form,
      partecipanti: [...(form.partecipanti || []), { nome: '', classe: '' }],
      pg_count: Math.max(form.pg_count || 1, (form.partecipanti || []).length + 1),
    }));
  }

  removePartecipante(index: number) {
    this.form.update(form => {
      const partecipanti = (form.partecipanti || []).filter((_, i) => i !== index);
      return { ...form, partecipanti, pg_count: Math.max(1, partecipanti.length) };
    });
  }

  updatePartecipante(index: number, key: 'nome' | 'classe', value: string) {
    this.form.update(form => {
      const partecipanti = [...(form.partecipanti || [])];
      partecipanti[index] = { ...partecipanti[index], [key]: value };
      return { ...form, partecipanti };
    });
  }

  save() {
    const token = this.auth.token();
    const user = this.auth.currentUser();
    if (!token || !user) {
      this.error.set('Accedi con il tuo account per registrare una run.');
      return;
    }
    if (!this.form().dungeon_nome) {
      this.error.set('Seleziona un dungeon.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.ds.createRun(this.form(), token, user.id).subscribe({
      next: () => {
        this.ds.loadRuns();
        this.form.set(EMPTY_RUN());
        this.saved.set(true);
        this.saving.set(false);
      },
      error: error => {
        this.error.set(this.formatError(error, 'Impossibile salvare la run.'));
        this.saving.set(false);
      },
    });
  }

  askDelete(id: string) {
    this.confirmDelete.set(id);
  }

  deleteRun() {
    const id = this.confirmDelete();
    const token = this.auth.token();
    if (!id || !token) return;
    this.ds.deleteRun(id, token).subscribe({
      next: () => {
        this.ds.loadRuns();
        this.confirmDelete.set(null);
      },
      error: error => this.error.set(this.formatError(error, 'Impossibile eliminare la run.')),
    });
  }

  private formatError(error: any, fallback: string) {
    const data = error?.error?.data;
    if (data && Object.keys(data).length) return `${fallback} ${JSON.stringify(data)}`;
    return error?.error?.message || error?.message || fallback;
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DungeonService } from '../../services/dungeon.service';
import { AuthService } from '../../services/auth.service';
import { Dungeon, DungeonRecord, DungeonRun, DungeonRunRecord } from '../../models/dungeon.model';

const EMPTY_DUNGEON = (): Partial<Dungeon> => ({
  nome: '', descrizione: '', difficolta: 1, bauli: [],
  posizione_mappa: '', screenshot: '', protezione_elementale: '', note: '',
});

const EMPTY_RUN = (dungeonNome: string): Partial<DungeonRun> => ({
  dungeon_nome: dungeonNome, monete: 0, pelli: [], tempo: 0,
  pg_count: 1, partecipanti: [], data: new Date().toISOString().split('T')[0], note: '',
});

@Component({
  selector: 'app-dungeon-admin',
  imports: [FormsModule],
  templateUrl: './dungeon-admin.html',
})
export class DungeonAdminComponent {
  ds = inject(DungeonService);
  auth = inject(AuthService);

  editing = signal<DungeonRecord | null>(null);
  showForm = signal(false);
  form = signal<Partial<Dungeon>>(EMPTY_DUNGEON());
  saving = signal(false);
  confirmDelete = signal<string | null>(null);

  runForDungeon = signal<string | null>(null);
  runForm = signal<Partial<DungeonRun>>(EMPTY_RUN(''));
  savingRun = signal(false);
  confirmDeleteRun = signal<string | null>(null);

  stars = [1, 2, 3, 4, 5];

  runsForSelected = computed(() => {
    const nome = this.runForDungeon();
    if (!nome) return [];
    return this.ds.runs().filter(r => r.dungeon_nome === nome);
  });

  knownClasses = computed(() => this.ds.uniqueClasses());

  // --- Dungeon CRUD ---

  openNew() {
    this.editing.set(null);
    this.form.set(EMPTY_DUNGEON());
    this.showForm.set(true);
    this.runForDungeon.set(null);
  }

  openEdit(d: DungeonRecord) {
    this.editing.set(d);
    this.form.set({ ...d, bauli: [...(d.bauli || [])] });
    this.showForm.set(true);
    this.runForDungeon.set(null);
  }

  cancel() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  save() {
    const token = this.auth.token();
    if (!token) return;
    this.saving.set(true);
    const existing = this.editing();
    const op = existing
      ? this.ds.updateDungeon(existing.id, this.form(), token)
      : this.ds.createDungeon(this.form(), token);
    op.subscribe({
      next: () => { this.ds.loadDungeons(); this.cancel(); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }

  askDelete(id: string) { this.confirmDelete.set(id); }

  doDelete() {
    const id = this.confirmDelete();
    const token = this.auth.token();
    if (!id || !token) return;
    this.ds.deleteDungeon(id, token).subscribe(() => {
      this.ds.loadDungeons();
      this.ds.loadRuns();
      this.confirmDelete.set(null);
    });
  }

  updateField(key: keyof Dungeon, value: unknown) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  // --- Bauli ---

  addBaule() {
    this.form.update(f => ({ ...f, bauli: [...(f.bauli || []), { lucchetti: 1 }] }));
  }

  removeBaule(i: number) {
    this.form.update(f => ({ ...f, bauli: (f.bauli || []).filter((_, idx) => idx !== i) }));
  }

  setBauleLucchetti(i: number, v: number) {
    this.form.update(f => {
      const bauli = [...(f.bauli || [])];
      bauli[i] = { lucchetti: v };
      return { ...f, bauli };
    });
  }

  // --- Run management ---

  openRunPanel(dungeonNome: string) {
    this.runForDungeon.set(dungeonNome);
    this.runForm.set(EMPTY_RUN(dungeonNome));
    this.showForm.set(false);
  }

  closeRunPanel() { this.runForDungeon.set(null); }

  saveRun() {
    const token = this.auth.token();
    const user = this.auth.currentUser();
    if (!token) return;
    this.savingRun.set(true);
    this.ds.createRun(this.runForm(), token, user?.id).subscribe({
      next: () => {
        this.ds.loadRuns();
        this.runForm.set(EMPTY_RUN(this.runForDungeon() || ''));
        this.savingRun.set(false);
      },
      error: () => this.savingRun.set(false),
    });
  }

  askDeleteRun(id: string) { this.confirmDeleteRun.set(id); }

  doDeleteRun() {
    const id = this.confirmDeleteRun();
    const token = this.auth.token();
    if (!id || !token) return;
    this.ds.deleteRun(id, token).subscribe(() => {
      this.ds.loadRuns();
      this.confirmDeleteRun.set(null);
    });
  }

  updateRunField(key: keyof DungeonRun, value: unknown) {
    this.runForm.update(f => ({ ...f, [key]: value }));
  }

  // --- Pelli in run ---

  addPella() {
    this.runForm.update(f => ({ ...f, pelli: [...(f.pelli || []), { nome: '', quantita: 1 }] }));
  }

  removePella(i: number) {
    this.runForm.update(f => ({ ...f, pelli: (f.pelli || []).filter((_, idx) => idx !== i) }));
  }

  updatePella(i: number, key: 'nome' | 'quantita', val: string | number) {
    this.runForm.update(f => {
      const pelli = [...(f.pelli || [])];
      pelli[i] = { ...pelli[i], [key]: val };
      return { ...f, pelli };
    });
  }

  // --- Partecipanti in run ---

  addPartecipante() {
    this.runForm.update(f => ({ ...f, partecipanti: [...(f.partecipanti || []), { nome: '', classe: '' }] }));
  }

  removePartecipante(i: number) {
    this.runForm.update(f => ({ ...f, partecipanti: (f.partecipanti || []).filter((_, idx) => idx !== i) }));
  }

  updatePartecipante(i: number, key: 'nome' | 'classe', val: string) {
    this.runForm.update(f => {
      const partecipanti = [...(f.partecipanti || [])];
      partecipanti[i] = { ...partecipanti[i], [key]: val };
      return { ...f, partecipanti };
    });
  }

  rewardLabel(lucchetti: number): string {
    const labels: Record<number, string> = { 1: 'Molto bassa', 2: 'Bassa', 3: 'Media', 4: 'Alta', 5: 'Molto alta' };
    return labels[lucchetti] || '';
  }
}

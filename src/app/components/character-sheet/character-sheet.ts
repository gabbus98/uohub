import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SKILL_LIST } from '../skill-calc/skill-calc';
import { AuthService } from '../../services/auth.service';
import { CharacterProfileService, CharacterSheet } from '../../services/character-profile.service';

const SKILL_CAP = 700;
const STAT_CAP = 225;
const SKILL_MAX = 100;

const EMPTY_SHEET = (): CharacterSheet => ({
  nome: '',
  razza: '',
  classe: '',
  divinita: '',
  ruolo: '',
  gilda: '',
  forza: 75,
  destrezza: 75,
  intelligenza: 75,
  skills: [],
  obiettivi: '',
  note: '',
});

@Component({
  selector: 'app-character-sheet',
  imports: [FormsModule],
  templateUrl: './character-sheet.html',
})
export class CharacterSheetComponent {
  private auth = inject(AuthService);
  private profiles = inject(CharacterProfileService);

  skillList = SKILL_LIST;
  skillCap = SKILL_CAP;
  statCap = STAT_CAP;

  private nextSkillId = 0;
  private loadedForUser = '';
  recordId = signal<string | null>(null);
  sheet = signal<CharacterSheet>(EMPTY_SHEET());
  loading = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  user = this.auth.currentUser;
  token = this.auth.token;

  skillTotal = computed(() => this.sheet().skills.reduce((sum, skill) => sum + (skill.value || 0), 0));
  skillRemaining = computed(() => SKILL_CAP - this.skillTotal());
  skillOverCap = computed(() => this.skillTotal() > SKILL_CAP);
  skillFill = computed(() => Math.min((this.skillTotal() / SKILL_CAP) * 100, 100));

  statTotal = computed(() => this.sheet().forza + this.sheet().destrezza + this.sheet().intelligenza);
  statRemaining = computed(() => STAT_CAP - this.statTotal());
  statOverCap = computed(() => this.statTotal() > STAT_CAP);
  statFill = computed(() => Math.min((this.statTotal() / STAT_CAP) * 100, 100));

  constructor() {
    effect(() => {
      const user = this.user();
      const token = this.token();
      if (!user || !token || this.loadedForUser === user.id) return;
      this.loadedForUser = user.id;
      this.load(user.id, token);
    });
  }

  updateField(key: keyof CharacterSheet, value: string | number) {
    this.sheet.update(sheet => ({ ...sheet, [key]: value }));
    this.saved.set(false);
  }

  updateStat(key: 'forza' | 'destrezza' | 'intelligenza', raw: string | number) {
    let value = Math.round(Number(raw));
    if (Number.isNaN(value)) value = 0;
    value = Math.max(0, Math.min(125, value));
    this.updateField(key, value);
  }

  addSkill() {
    const used = new Set(this.sheet().skills.map(skill => skill.name));
    const name = SKILL_LIST.find(skill => !used.has(skill)) ?? SKILL_LIST[0];
    this.sheet.update(sheet => ({
      ...sheet,
      skills: [...sheet.skills, { id: this.nextSkillId++, name, value: 0 }],
    }));
    this.saved.set(false);
  }

  removeSkill(id: number) {
    this.sheet.update(sheet => ({
      ...sheet,
      skills: sheet.skills.filter(skill => skill.id !== id),
    }));
    this.saved.set(false);
  }

  updateSkillName(id: number, name: string) {
    this.sheet.update(sheet => ({
      ...sheet,
      skills: sheet.skills.map(skill => skill.id === id ? { ...skill, name } : skill),
    }));
    this.saved.set(false);
  }

  updateSkillValue(id: number, raw: string | number) {
    let value = Math.round(Number(raw));
    if (Number.isNaN(value)) value = 0;
    value = Math.max(0, Math.min(SKILL_MAX, value));
    this.sheet.update(sheet => ({
      ...sheet,
      skills: sheet.skills.map(skill => skill.id === id ? { ...skill, value } : skill),
    }));
    this.saved.set(false);
  }

  save() {
    const user = this.user();
    const token = this.token();
    if (!user || !token) {
      this.error.set('Accedi con il tuo account per salvare la scheda.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const existingId = this.recordId();
    const op = existingId
      ? this.profiles.update(existingId, this.sheet(), token)
      : this.profiles.create(user.id, this.sheet(), token);

    op.subscribe({
      next: record => {
        this.recordId.set(record.id);
        this.saved.set(true);
        this.saving.set(false);
      },
      error: error => {
        this.error.set(this.formatError(error, 'Impossibile salvare la scheda personaggio.'));
        this.saving.set(false);
      },
    });
  }

  reset() {
    const recordId = this.recordId();
    const token = this.token();
    this.nextSkillId = 0;
    this.sheet.set(EMPTY_SHEET());
    this.saved.set(false);
    if (recordId && token) {
      this.profiles.delete(recordId, token).subscribe({
        next: () => this.recordId.set(null),
        error: error => this.error.set(this.formatError(error, 'Impossibile eliminare la scheda salvata.')),
      });
    } else {
      this.recordId.set(null);
    }
  }

  barColor(total: number, cap: number) {
    const pct = (total / cap) * 100;
    if (pct < 80) return 'var(--green)';
    if (pct <= 100) return 'var(--gold)';
    return 'var(--red)';
  }

  private load(userId: string, token: string) {
    this.loading.set(true);
    this.error.set('');
    this.profiles.load(userId, token).subscribe({
      next: res => {
        const record = res.items[0];
        this.recordId.set(record?.id || null);
        this.sheet.set(record ? this.normalizeSheet(record.data) : EMPTY_SHEET());
        this.saved.set(!!record);
        this.loading.set(false);
      },
      error: error => {
        this.error.set(this.formatError(error, 'Impossibile caricare la scheda personaggio.'));
        this.loading.set(false);
      },
    });
  }

  private normalizeSheet(raw: unknown): CharacterSheet {
    const sheet = this.parseSheet(raw);
    const skills = (sheet.skills || []).map(skill => ({
      id: this.nextSkillId++,
      name: skill.name || SKILL_LIST[0],
      value: Math.max(0, Math.min(SKILL_MAX, Number(skill.value) || 0)),
    }));

    return {
      ...EMPTY_SHEET(),
      ...sheet,
      forza: Number(sheet.forza) || 0,
      destrezza: Number(sheet.destrezza) || 0,
      intelligenza: Number(sheet.intelligenza) || 0,
      skills,
    };
  }

  private formatError(error: any, fallback: string) {
    const data = error?.error?.data;
    if (data && Object.keys(data).length) return `${fallback} ${JSON.stringify(data)}`;
    return error?.error?.message || error?.message || fallback;
  }

  private parseSheet(raw: unknown): Partial<CharacterSheet> {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Partial<CharacterSheet>;
      } catch {
        return {};
      }
    }
    return raw as Partial<CharacterSheet>;
  }
}

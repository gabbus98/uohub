import { Component, signal, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SkillBuildRecord, SkillBuildService } from '../../services/skill-build.service';

const SKILL_CAP = 700;
const SKILL_MAX = 100;

export const SKILL_LIST = [
  'Animal Lore', 'Animal Taming', 'Anatomy', 'Archery', 'Arms Lore',
  'Begging', 'Blacksmithing', 'Bowcraft/Fletching', 'Bushido', 'Camping',
  'Carpentry', 'Cartography', 'Chivalry', 'Cooking', 'Discordance',
  'Detect Hidden', 'Evaluate Intelligence', 'Fencing', 'Fishing', 'Focus',
  'Forensic Evaluation', 'Healing', 'Herding', 'Hiding', 'Imbuing',
  'Inscribe', 'Item Identification', 'Lockpicking', 'Lumberjacking',
  'Mace Fighting', 'Magery', 'Magic Resistance', 'Meditation',
  'Mining', 'Musicianship', 'Mysticism', 'Necromancy', 'Ninjitsu',
  'Parrying', 'Peacemaking', 'Poisoning', 'Provocation', 'Remove Trap',
  'Snooping', 'Spirit Speak', 'Stealing', 'Stealth', 'Swords',
  'Tactics', 'Tailoring', 'Taste Identification', 'Throwing', 'Tinkering',
  'Tracking', 'Veterinary', 'Wrestling',
  'Hunting' // custom shard skill
];

export interface SkillRow {
  id: number;
  name: string;
  value: number;
}

@Component({
  selector: 'app-skill-calc',
  imports: [FormsModule],
  templateUrl: './skill-calc.html'
})
export class SkillCalcComponent {
  private auth = inject(AuthService);
  private skillBuilds = inject(SkillBuildService);

  skillList = SKILL_LIST;
  cap = SKILL_CAP;
  skillMax = SKILL_MAX;
  currentUser = this.auth.currentUser;

  private nextId = 0;
  private loadedForUser = '';
  rows = signal<SkillRow[]>([
    { id: this.nextId++, name: 'Hunting',  value: 100 },
    { id: this.nextId++, name: 'Tracking', value: 80 },
    { id: this.nextId++, name: 'Healing',  value: 70 },
    { id: this.nextId++, name: 'Tactics',  value: 100 },
  ]);

  total = computed(() => this.rows().reduce((s, r) => s + (r.value || 0), 0));
  remaining = computed(() => SKILL_CAP - this.total());
  overCap = computed(() => this.total() > SKILL_CAP);
  fillPercent = computed(() => Math.min((this.total() / SKILL_CAP) * 100, 100));
  buildName = signal('');
  builds = signal<SkillBuildRecord[]>([]);
  selectedBuildId = signal('');
  buildSaving = signal(false);
  buildError = signal('');
  buildSaved = signal(false);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      const token = this.auth.token();
      if (!user || !token || this.loadedForUser === user.id) return;
      this.loadedForUser = user.id;
      this.loadBuilds(user.id, token);
    });
  }

  addRow() {
    const used = new Set(this.rows().map(r => r.name));
    const free = SKILL_LIST.find(s => !used.has(s)) ?? SKILL_LIST[0];
    this.rows.update(rows => [...rows, { id: this.nextId++, name: free, value: 0 }]);
  }

  removeRow(id: number) {
    this.rows.update(rows => rows.filter(r => r.id !== id));
  }

  updateName(id: number, name: string) {
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, name } : r));
  }

  updateValue(id: number, raw: string | number) {
    let v = Math.round(Number(raw));
    if (isNaN(v)) v = 0;
    v = Math.max(0, Math.min(SKILL_MAX, v));
    this.rows.update(rows => rows.map(r => r.id === id ? { ...r, value: v } : r));
  }

  reset() {
    this.rows.set([]);
    this.selectedBuildId.set('');
    this.buildName.set('');
  }

  barColor() {
    const pct = this.fillPercent();
    if (pct < 80) return 'var(--green)';
    if (pct < 100) return 'var(--gold)';
    return 'var(--red)';
  }

  saveBuild() {
    const user = this.auth.currentUser();
    const token = this.auth.token();
    if (!user || !token) {
      this.buildError.set('Accedi con il tuo account per salvare una build.');
      return;
    }

    const nome = this.buildName().trim();
    if (!nome) {
      this.buildError.set('Dai un nome alla build.');
      return;
    }

    this.buildSaving.set(true);
    this.buildError.set('');
    this.buildSaved.set(false);
    const rows = this.rows().map(row => ({ ...row }));
    const selected = this.selectedBuildId();
    const op = selected
      ? this.skillBuilds.update(selected, nome, rows, token)
      : this.skillBuilds.create(user.id, nome, rows, token);

    op.subscribe({
      next: build => {
        this.selectedBuildId.set(build.id);
        this.buildName.set(build.nome);
        this.loadBuilds(user.id, token);
        this.buildSaving.set(false);
        this.buildSaved.set(true);
      },
      error: error => {
        this.buildError.set(this.formatError(error, 'Impossibile salvare la build.'));
        this.buildSaving.set(false);
      },
    });
  }

  applyBuild(build: SkillBuildRecord) {
    this.nextId = 0;
    const skills = this.parseSkills(build.skills).map(skill => ({
      id: this.nextId++,
      name: skill.name,
      value: skill.value,
    }));
    this.rows.set(skills);
    this.selectedBuildId.set(build.id);
    this.buildName.set(build.nome);
    this.buildSaved.set(false);
    this.buildError.set('');
  }

  deleteBuild(build: SkillBuildRecord) {
    const user = this.auth.currentUser();
    const token = this.auth.token();
    if (!user || !token) return;

    this.skillBuilds.delete(build.id, token).subscribe({
      next: () => {
        if (this.selectedBuildId() === build.id) {
          this.selectedBuildId.set('');
          this.buildName.set('');
        }
        this.loadBuilds(user.id, token);
      },
      error: error => this.buildError.set(this.formatError(error, 'Impossibile eliminare la build.')),
    });
  }

  buildTotal(build: SkillBuildRecord) {
    return build.skills.reduce((sum, skill) => sum + (skill.value || 0), 0);
  }

  private loadBuilds(userId: string, token: string) {
    this.skillBuilds.load(userId, token).subscribe({
      next: res => this.builds.set(res.items.map(build => ({ ...build, skills: this.parseSkills(build.skills) }))),
      error: error => this.buildError.set(this.formatError(error, 'Impossibile caricare le build salvate.')),
    });
  }

  private parseSkills(raw: unknown): SkillRow[] {
    let value = raw;
    if (typeof raw === 'string') {
      try {
        value = JSON.parse(raw || '[]');
      } catch {
        value = [];
      }
    }
    return Array.isArray(value)
      ? value.map(skill => ({
        id: Number(skill.id) || 0,
        name: skill.name || SKILL_LIST[0],
        value: Math.max(0, Math.min(SKILL_MAX, Number(skill.value) || 0)),
      }))
      : [];
  }

  private formatError(error: any, fallback: string) {
    const data = error?.error?.data;
    if (data && Object.keys(data).length) return `${fallback} ${JSON.stringify(data)}`;
    return error?.error?.message || error?.message || fallback;
  }
}

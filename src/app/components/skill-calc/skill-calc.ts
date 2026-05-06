import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  skillList = SKILL_LIST;
  cap = SKILL_CAP;
  skillMax = SKILL_MAX;

  private nextId = 0;
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
  }

  barColor() {
    const pct = this.fillPercent();
    if (pct < 80) return 'var(--green)';
    if (pct < 100) return 'var(--gold)';
    return 'var(--red)';
  }
}

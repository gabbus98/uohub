import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface RuneDef {
  label: string;
  type: number;
  blood: string[];
}

interface MinorRuneDef {
  label: string;
}

interface RuneRow {
  id: number;
  name: string;
  level: number;
  from: number;
}

interface CrystalCost {
  crystal: 'polveri' | 'frammenti' | 'cristalli';
  quantity: number;
  core: number;
  superiorCore: number;
}

const MAJOR_RUNES: RuneDef[] = [
  { label: '', type: 999, blood: [] },
  { label: 'Magico', type: 0, blood: [] },
  { label: 'Fuoco', type: 0, blood: ['incandescente'] },
  { label: 'Freddo', type: 0, blood: ['glaciale'] },
  { label: 'Energia', type: 0, blood: ['titanico'] },
  { label: 'Psionico', type: 0, blood: ['illithid'] },
  { label: 'Veleno', type: 0, blood: ['venefico'] },
  { label: 'Sacro', type: 0, blood: ['iridescente'] },
  { label: 'Male', type: 0, blood: ['demoniaco'] },
  { label: 'Danno', type: 1, blood: ['vigoroso'] },
  { label: 'Precisione', type: 1, blood: ['volatile'] },
  { label: 'Parassitico', type: 1, blood: ['corrotto'] },
  { label: 'Dispersione', type: 0, blood: ['etereo'] },
  { label: 'Canalizzante', type: 0, blood: ['incandescente', 'glaciale', 'titanico', 'etereo'] },
  { label: 'Sterminatore', type: 0, blood: ['vigoroso', 'volatile', 'stabile'] },
  { label: 'Scioglilingua', type: 1, blood: ['volatile'] },
  { label: 'Indissolubile', type: 1, blood: ['stabile'] },
  { label: 'Conciliante', type: 2, blood: ['stabile'] },
  { label: 'Provocante', type: 2, blood: ['vigoroso'] },
  { label: 'Assordante', type: 2, blood: ['volatile'] },
  { label: 'Vibrante', type: 2, blood: ['titanico'] },
];

const NORMAL_COSTS: CrystalCost[] = [
  { crystal: 'polveri', quantity: 5, core: 0, superiorCore: 0 },
  { crystal: 'frammenti', quantity: 3, core: 0, superiorCore: 0 },
  { crystal: 'cristalli', quantity: 2, core: 0, superiorCore: 0 },
];

const MAGIC_COSTS: CrystalCost[] = [
  { crystal: 'polveri', quantity: 7, core: 0, superiorCore: 0 },
  { crystal: 'frammenti', quantity: 4, core: 0, superiorCore: 0 },
  { crystal: 'cristalli', quantity: 3, core: 0, superiorCore: 0 },
];

const CRYSTAL_WEIGHT: Record<CrystalCost['crystal'], number> = {
  polveri: 1,
  frammenti: 2,
  cristalli: 6,
};

const MINOR_RUNES: MinorRuneDef[] = [
  { label: '' },
  { label: 'Resistenza' },
  { label: 'Catena' },
];

const MINOR_ITEMS: Record<string, { item: string; gold: number }> = {
  Resistenza: { item: 'Tavola della Durabilita', gold: 50000 },
  Catena: { item: 'Catena per arma', gold: 0 },
};

@Component({
  selector: 'app-enchant-cost',
  imports: [FormsModule],
  templateUrl: './enchant-cost.html',
  styleUrl: './enchant-cost.scss',
})
export class EnchantCostComponent {
  private nextId = 0;

  majorRunes: RuneRow[] = [];
  minorRunes: RuneRow[] = [];

  readonly maxMajorLevelTotal = 10;
  readonly majorRuneLimit = 4;
  readonly minorRuneLimit = MINOR_RUNES.length - 1;

  get remainingMajorLevels() {
    return this.maxMajorLevelTotal - this.majorRunes.reduce((sum, rune) => sum + (rune.name ? rune.level : 0), 0);
  }

  get canAddMajorRune() {
    return this.majorRunes.length < this.majorRuneLimit && this.remainingMajorLevels > 0;
  }

  get canAddMinorRune() {
    return this.minorRunes.length < this.minorRuneLimit;
  }

  get totalCostEntries() {
    const total: Record<string, number> = {};

    for (const rune of this.majorRunes) {
      this.addCost(total, this.majorRuneCost(rune));
    }

    for (const rune of this.minorRunes) {
      this.addCost(total, this.minorRuneCost(rune));
    }

    return Object.entries(total)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));
  }

  addMajorRune() {
    this.majorRunes = [...this.majorRunes, this.newRune()];
  }

  removeMajorRune(id: number) {
    this.majorRunes = this.majorRunes.filter(rune => rune.id !== id);
  }

  addMinorRune() {
    this.minorRunes = [...this.minorRunes, this.newRune()];
  }

  removeMinorRune(id: number) {
    this.minorRunes = this.minorRunes.filter(rune => rune.id !== id);
  }

  availableMajorRunes(current: RuneRow) {
    const currentType = MAJOR_RUNES.find(rune => rune.label === current.name)?.type ?? -1;
    const selectedNames = this.majorRunes
      .filter(rune => rune !== current && rune.name)
      .map(rune => rune.name);

    let activeType = -1;
    for (const rune of this.majorRunes) {
      const type = MAJOR_RUNES.find(def => def.label === rune.name)?.type;
      if (rune !== current && rune.name && (type === 0 || type === 2)) {
        activeType = type;
      }
    }

    return MAJOR_RUNES.filter(rune =>
      (
        rune.label === '' ||
        selectedNames.length === 0 ||
        (activeType === -1 && rune.type !== 2) ||
        (rune.type === 2 && activeType === 2) ||
        (activeType === 0 && rune.type === 1) ||
        currentType === 0 ||
        currentType === 2
      ) &&
      !selectedNames.includes(rune.label)
    );
  }

  availableMinorRunes(current: RuneRow) {
    const selectedNames = this.minorRunes
      .filter(rune => rune !== current && rune.name)
      .map(rune => rune.name);

    return MINOR_RUNES.filter(rune => !selectedNames.includes(rune.label));
  }

  majorLevelOptions(rune: RuneRow) {
    const max = Math.min(3, rune.level + this.remainingMajorLevels);
    return this.levelRange(1, max);
  }

  fromOptions(rune: RuneRow) {
    return this.levelRange(0, Math.max(0, rune.level - 1));
  }

  changeName(rune: RuneRow, name: string, kind: 'major' | 'minor') {
    rune.name = name;
    rune.from = name ? rune.from : 0;
    rune.level = name ? Math.max(1, rune.level) : 1;
    this.refresh(kind);
  }

  changeFrom(rune: RuneRow, raw: string | number, kind: 'major' | 'minor') {
    rune.from = Number(raw);
    if (rune.from >= rune.level) {
      rune.level = Math.min(kind === 'major' ? 3 : 5, rune.from + 1);
    }
    this.refresh(kind);
  }

  changeLevel(rune: RuneRow, raw: string | number, kind: 'major' | 'minor') {
    rune.level = Number(raw);
    if (rune.from > rune.level) {
      rune.from = rune.level;
    }
    this.refresh(kind);
  }

  majorRuneCost(rune: RuneRow) {
    if (!rune.name) return {};

    const cost: Record<string, number> = {
      polveri: 0,
      frammenti: 0,
      cristalli: 0,
      Nucleo: 0,
      'Nucleo Formidabile': 0,
    };
    const definition = MAJOR_RUNES.find(item => item.label === rune.name);
    if (!definition) return cost;

    for (let level = rune.from; level < rune.level; level++) {
      const row = rune.name === 'Magico' ? MAGIC_COSTS[level] : NORMAL_COSTS[level];
      if (!row) continue;

      const multiplier = definition.blood.length || 1;
      cost[row.crystal] += row.quantity * multiplier;
      if (row.core) cost['Nucleo'] = 1;
      if (row.superiorCore) cost['Nucleo Formidabile'] = 1;

      for (const blood of definition.blood) {
        cost[blood] = (cost[blood] ?? 0) + row.quantity * CRYSTAL_WEIGHT[row.crystal];
      }
    }

    return cost;
  }

  minorRuneCost(rune: RuneRow) {
    if (!rune.name || !MINOR_ITEMS[rune.name]) return {};

    let itemCount = 0;
    for (let level = rune.from; level < rune.level; level++) {
      itemCount += level + 1;
    }

    return { [MINOR_ITEMS[rune.name].item]: itemCount };
  }

  costEntries(rune: RuneRow, kind: 'major' | 'minor') {
    const cost = kind === 'major' ? this.majorRuneCost(rune) : this.minorRuneCost(rune);
    return Object.entries(cost)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));
  }

  private newRune(): RuneRow {
    return {
      id: this.nextId++,
      name: '',
      level: 1,
      from: 0,
    };
  }

  private refresh(kind: 'major' | 'minor') {
    if (kind === 'major') {
      this.majorRunes = [...this.majorRunes.filter(rune => rune.name || this.remainingMajorLevels < this.maxMajorLevelTotal)];
    } else {
      this.minorRunes = [...this.minorRunes];
    }
  }

  private levelRange(from: number, to: number) {
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);
  }

  private addCost(total: Record<string, number>, cost: Record<string, number>) {
    for (const [label, value] of Object.entries(cost)) {
      total[label] = (total[label] ?? 0) + value;
    }
  }
}

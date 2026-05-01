import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type SkillLevel = 100 | 200 | 241 | 245;
type WeaponType = 'Arco' | 'Balestra';
type StatKey = 'hands' | 'speed' | 'power' | 'range' | 'wear' | 'special' | 'primary' | 'secondary';

interface WeaponStats {
  hands: number | string;
  speed: number | string;
  power: number | string;
  range: number | string;
  wear: number | string;
  special: string;
  primary: string;
  secondary: string;
  craftable: boolean;
}

interface Weapon {
  name: string;
  type: WeaponType;
  stats: Record<SkillLevel, WeaponStats>;
}

interface WoodRow {
  name: string;
  damage: string;
  bowWear: string;
  crossbowWear: string;
  tone?: 'red' | 'blue' | 'green' | 'gold';
}

const SKILL_LEVELS: SkillLevel[] = [100, 200, 241, 245];
const EMPTY_STATS: WeaponStats = {
  hands: 2,
  speed: '-',
  power: '-',
  range: '-',
  wear: '-',
  special: 'Non Craftabile',
  primary: 'Tiro Multiplo',
  secondary: 'Scocco in movimento',
  craftable: false,
};

function stats(
  hands: number,
  speed: number,
  power: number,
  range: number,
  wear: number,
  special: string,
  primary: string,
  secondary: string,
): WeaponStats {
  return { hands, speed, power, range, wear, special, primary, secondary, craftable: true };
}

const WOODS: WoodRow[] = [
  { name: 'Comune', damage: '100% Fisico', bowWear: 'base', crossbowWear: 'base' },
  { name: 'Vulcanico', damage: 'Fuoco 30%', bowWear: '-', crossbowWear: '-', tone: 'red' },
  { name: 'Artico', damage: 'Freddo 30%', bowWear: '-', crossbowWear: '-', tone: 'blue' },
  { name: 'Insanguinato', damage: 'Psionico 30%', bowWear: '-', crossbowWear: '-', tone: 'gold' },
  { name: 'Lunare', damage: 'Magico 30%', bowWear: '-', crossbowWear: '-', tone: 'blue' },
  { name: 'Selvaggio', damage: 'Veleno 30%', bowWear: '-', crossbowWear: '-', tone: 'green' },
  { name: 'Millenario', damage: 'Energia 30%', bowWear: '78', crossbowWear: '96', tone: 'blue' },
  { name: 'Regale', damage: 'Magico 15% + Sacro 15%', bowWear: '-', crossbowWear: '-', tone: 'gold' },
  { name: 'Sotterraneo', damage: 'Male 15% + Veleno 15%', bowWear: '-', crossbowWear: '-', tone: 'green' },
  { name: 'Antico', damage: 'Psionico 15% + Sacro 15%', bowWear: '-', crossbowWear: '-', tone: 'gold' },
  { name: 'Fossile', damage: 'Psionico 15% + Energia 15%', bowWear: '-', crossbowWear: '-', tone: 'blue' },
  { name: 'Dorato', damage: 'Sacro 30%', bowWear: '-', crossbowWear: '-', tone: 'gold' },
  { name: 'Oscuro', damage: 'Male 30%', bowWear: '-', crossbowWear: '-', tone: 'red' },
  { name: 'Costiero', damage: 'Freddo 15% + Energia 15%', bowWear: '-', crossbowWear: '36', tone: 'blue' },
  { name: 'Esotico', damage: 'Magico 15% + Veleno 15%', bowWear: '-', crossbowWear: '-', tone: 'green' },
];

const WEAPONS: Weapon[] = [
  {
    name: 'Arco corto',
    type: 'Arco',
    stats: {
      100: stats(2, 45, 20, 9, 33, '-', 'Scocco in movimento', 'Mortale'),
      200: stats(2, 51, 20, 9, 37, '-', 'Scocco in movimento', 'Mortale'),
      241: stats(2, 54, 20, 9, 39, '-', 'Scocco in movimento', 'Mortale'),
      245: stats(2, 54, 20, 9, 40, '-', 'Scocco in movimento', 'Mortale'),
    },
  },
  {
    name: 'Arco',
    type: 'Arco',
    stats: {
      100: stats(2, 28, 27, 11, 33, '-', 'Scocco in movimento', 'Mortale'),
      200: stats(2, 32, 27, 11, 37, '-', 'Scocco in movimento', 'Mortale'),
      241: stats(2, 33, 27, 11, 39, '-', 'Scocco in movimento', 'Mortale'),
      245: stats(2, 34, 27, 11, 40, '-', 'Scocco in movimento', 'Mortale'),
    },
  },
  {
    name: 'Arco lungo',
    type: 'Arco',
    stats: {
      100: stats(2, 22, 30, 13, 33, 'Pedone', 'Scocco in movimento', 'Mortale'),
      200: stats(2, 25, 30, 13, 37, 'Pedone', 'Scocco in movimento', 'Mortale'),
      241: stats(2, 26, 30, 13, 39, 'Pedone', 'Scocco in movimento', 'Mortale'),
      245: stats(2, 26, 30, 13, 40, 'Pedone', 'Scocco in movimento', 'Mortale'),
    },
  },
  {
    name: 'Arco a doppia curva',
    type: 'Arco',
    stats: {
      100: stats(2, 30, 25, 11, 33, '-', 'Devastante', 'Stordente'),
      200: stats(2, 34, 25, 11, 37, '-', 'Devastante', 'Stordente'),
      241: stats(2, 34, 25, 11, 39, '-', 'Devastante', 'Stordente'),
      245: stats(2, 36, 25, 11, 40, '-', 'Devastante', 'Stordente'),
    },
  },
  {
    name: 'Arco in osso',
    type: 'Arco',
    stats: {
      100: stats(2, 26, 27, 11, 33, 'Melee', 'Scocco in movimento', 'Lacerante'),
      200: stats(2, 29, 27, 11, 37, 'Melee', 'Scocco in movimento', 'Lacerante'),
      241: stats(2, 31, 27, 11, 39, 'Melee', 'Scocco in movimento', 'Lacerante'),
      245: stats(2, 31, 27, 11, 40, 'Melee', 'Scocco in movimento', 'Lacerante'),
    },
  },
  {
    name: 'Arco composito',
    type: 'Arco',
    stats: {
      100: stats(2, 26, 22, 11, 33, 'Check Frz', 'Stordente', 'Devastate'),
      200: stats(2, 29, 22, 11, 37, 'Check Frz', 'Stordente', 'Devastate'),
      241: stats(2, 31, 22, 11, 39, 'Check Frz', 'Stordente', 'Devastate'),
      245: stats(2, 31, 22, 11, 40, 'Check Frz', 'Stordente', 'Devastate'),
    },
  },
  {
    name: 'Arco elfico',
    type: 'Arco',
    stats: {
      100: stats(2, 28, 27, 11, 33, '20% Crit', 'Scocco in movimento', 'Tiro Multiplo'),
      200: stats(2, 32, 27, 11, 37, '20% Crit', 'Scocco in movimento', 'Tiro Multiplo'),
      241: stats(2, 33, 27, 11, 39, '20% Crit', 'Scocco in movimento', 'Tiro Multiplo'),
      245: stats(2, 34, 27, 11, 40, '20% Crit', 'Scocco in movimento', 'Tiro Multiplo'),
    },
  },
  {
    name: 'Balestra',
    type: 'Balestra',
    stats: {
      100: stats(1, 28, 27, 9, 41, '-', 'Perforante', 'Mortale'),
      200: stats(1, 32, 27, 9, 47, '-', 'Perforante', 'Mortale'),
      241: stats(1, 33, 27, 9, 49, '-', 'Perforante', 'Mortale'),
      245: stats(1, 34, 27, 9, 49, '-', 'Perforante', 'Mortale'),
    },
  },
  {
    name: 'Balestra pesante',
    type: 'Balestra',
    stats: {
      100: stats(2, 22, 29, 11, 41, 'Pedone', 'Disarciona', 'Devastate'),
      200: stats(2, 25, 29, 11, 47, 'Pedone', 'Disarciona', 'Devastate'),
      241: stats(2, 26, 29, 11, 49, 'Pedone', 'Disarciona', 'Devastate'),
      245: stats(2, 26, 29, 11, 49, 'Pedone', 'Disarciona', 'Devastate'),
    },
  },
  {
    name: 'Balestre Gemelle',
    type: 'Balestra',
    stats: {
      100: stats(2, 28, 27, 8, 41, '-', 'Mortale', 'Scocco in movimento'),
      200: stats(2, 32, 27, 8, 47, '-', 'Mortale', 'Scocco in movimento'),
      241: stats(2, 33, 27, 8, 49, '-', 'Mortale', 'Scocco in movimento'),
      245: stats(2, 34, 27, 8, 49, '-', 'Mortale', 'Scocco in movimento'),
    },
  },
  {
    name: 'Multibalestra Drow',
    type: 'Balestra',
    stats: {
      100: stats(2, 45, 22, 9, 82, 'Non Craftabile', 'Tiro Multiplo', 'Scocco in movimento'),
      200: EMPTY_STATS,
      241: EMPTY_STATS,
      245: EMPTY_STATS,
    },
  },
];

const COMPARE_FIELDS: { key: StatKey; label: string }[] = [
  { key: 'hands', label: 'Mani' },
  { key: 'speed', label: 'Rap.' },
  { key: 'power', label: 'Pot.' },
  { key: 'range', label: 'Git.' },
  { key: 'wear', label: 'Usura' },
  { key: 'special', label: 'Speciale' },
  { key: 'primary', label: 'Primaria' },
  { key: 'secondary', label: 'Secondaria' },
];

@Component({
  selector: 'app-ranged-weapons',
  imports: [FormsModule],
  templateUrl: './ranged-weapons.html',
  styleUrl: './ranged-weapons.scss',
})
export class RangedWeaponsComponent {
  readonly skillLevels = SKILL_LEVELS;
  readonly weapons = WEAPONS;
  readonly woods = WOODS;
  readonly compareFields = COMPARE_FIELDS;

  selectedSkill = signal<SkillLevel>(245);
  selectedType = signal<'Tutti' | WeaponType>('Tutti');
  query = signal('');

  leftWeapon = signal('Arco corto');
  leftSkill = signal<SkillLevel>(100);
  rightWeapon = signal('Arco corto');
  rightSkill = signal<SkillLevel>(245);

  filteredWeapons = computed(() => {
    const q = this.query().trim().toLowerCase();
    const type = this.selectedType();

    return this.weapons.filter((weapon) => {
      const matchesType = type === 'Tutti' || weapon.type === type;
      const matchesQuery = !q || weapon.name.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  });

  bestSpeed = computed(() => this.bestNumber('speed', true));
  bestPower = computed(() => this.bestNumber('power', true));
  bestRange = computed(() => this.bestNumber('range', true));
  bestWear = computed(() => this.bestNumber('wear', false));

  leftStats = computed(() => this.getStats(this.leftWeapon(), this.leftSkill()));
  rightStats = computed(() => this.getStats(this.rightWeapon(), this.rightSkill()));

  setSkill(raw: string | number) {
    this.selectedSkill.set(Number(raw) as SkillLevel);
  }

  setType(type: string) {
    if (type === 'Arco' || type === 'Balestra' || type === 'Tutti') {
      this.selectedType.set(type);
    }
  }

  setLeftSkill(raw: string | number) {
    this.leftSkill.set(Number(raw) as SkillLevel);
  }

  setRightSkill(raw: string | number) {
    this.rightSkill.set(Number(raw) as SkillLevel);
  }

  getStats(name: string, skill: SkillLevel): WeaponStats {
    return this.weapons.find((weapon) => weapon.name === name)?.stats[skill] ?? EMPTY_STATS;
  }

  getValue(statsRow: WeaponStats, field: StatKey): string | number {
    return statsRow[field];
  }

  isDifferent(field: StatKey): boolean {
    return this.getValue(this.leftStats(), field) !== this.getValue(this.rightStats(), field);
  }

  numericDelta(field: StatKey): number | null {
    const left = Number(this.getValue(this.leftStats(), field));
    const right = Number(this.getValue(this.rightStats(), field));
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    return right - left;
  }

  isBest(weapon: Weapon, field: 'speed' | 'power' | 'range' | 'wear'): boolean {
    const value = Number(weapon.stats[this.selectedSkill()][field]);
    if (!Number.isFinite(value)) return false;

    const best = {
      speed: this.bestSpeed(),
      power: this.bestPower(),
      range: this.bestRange(),
      wear: this.bestWear(),
    }[field];

    return value === best;
  }

  private bestNumber(field: 'speed' | 'power' | 'range' | 'wear', highest: boolean) {
    const values = this.filteredWeapons()
      .map((weapon) => Number(weapon.stats[this.selectedSkill()][field]))
      .filter((value) => Number.isFinite(value));

    if (!values.length) return NaN;
    return highest ? Math.max(...values) : Math.min(...values);
  }
}

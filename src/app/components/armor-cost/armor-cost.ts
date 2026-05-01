import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ArmorType {
  value: string;
  label: string;
  ingots: number;
}

interface Metal {
  label: string;
  res: string[];
  blood: string;
  color: string;
  magres: string;
  extra?: string;
  extraLong?: string;
}

const ARMOR_TYPES: ArmorType[] = [
  { value: 'mail', label: 'Maglia', ingots: 76 },
  { value: 'ring', label: 'Anelli', ingots: 72 },
  { value: 'plate', label: 'Piastre', ingots: 93 },
  { value: 'berserker', label: 'Berserker', ingots: 77 },
];

const METALS: Metal[] = [
  { label: 'Orialkon', res: ['magico', 'magia', 'etereo'], blood: 'etereo', color: '#8b734a', magres: 'magico' },
  { label: 'Pirite', res: ['fuoco', 'incandescente'], blood: 'incandescente', color: '#832008', magres: 'fuoco' },
  { label: 'Ossidiana', res: ['veleno', 'venefico'], blood: 'venefico', color: '#41736a', magres: 'veleno' },
  { label: 'Azurite', res: ['freddo', 'acqua', 'ghiaccio', 'glaciale'], blood: 'glaciale', color: '#397b9c', magres: 'freddo' },
  { label: 'Titanio', res: ['malefico', 'demoniaco'], blood: 'demoniaco', color: '#393939', magres: 'male' },
  { label: 'Merkite', res: ['psionico', 'mente', 'illithid'], blood: 'illithid', color: '#83418b', magres: 'psionico' },
  { label: 'Valorium', res: ['energia', 'elettric', 'titanico'], blood: 'titanico', color: '#c58b20', magres: 'energia' },
  { label: 'Talavholk', res: ['sacro', 'bene', 'iridescente', 'thalavolk', 'thalavholk'], blood: 'iridescente', color: '#6a5a73', magres: 'sacro' },
  { label: 'Adamantio', res: ['fisico', 'stabile', 'ar'], blood: 'stabile', color: '#f6eede', magres: '', extra: 'AR migliorata', extraLong: 'AR migliorata' },
  { label: 'Ithilmar', res: ['leggerezza', 'volatile', 'itilmar'], blood: 'volatile', color: '#7b94a4', magres: '', extra: 'leggerezza', extraLong: 'Peso totale minore' },
];

@Component({
  selector: 'app-armor-cost',
  imports: [FormsModule],
  templateUrl: './armor-cost.html',
  styleUrl: './armor-cost.scss',
})
export class ArmorCostComponent {
  armorTypes = ARMOR_TYPES;
  metals = METALS;

  mode = signal<'single' | 'multi'>('single');
  selectedArmorValue = signal('');
  primaryMetalLabel = signal('');
  secondaryMetalLabel = signal('');

  selectedArmor = computed(() =>
    this.armorTypes.find(armor => armor.value === this.selectedArmorValue()) ?? null
  );

  primaryMetal = computed(() =>
    this.metals.find(metal => metal.label === this.primaryMetalLabel()) ?? null
  );

  secondaryMetal = computed(() =>
    this.metals.find(metal => metal.label === this.secondaryMetalLabel()) ?? null
  );

  availablePrimaryMetals = computed(() =>
    this.metals.filter(metal => metal.label !== this.secondaryMetalLabel())
  );

  availableSecondaryMetals = computed(() =>
    this.metals.filter(metal => metal.label !== this.primaryMetalLabel())
  );

  canCalculate = computed(() => {
    if (!this.selectedArmor() || !this.primaryMetal()) return false;
    return this.mode() === 'single' || !!this.secondaryMetal();
  });

  resources = computed(() => {
    const armor = this.selectedArmor();
    const primary = this.primaryMetal();
    if (!armor || !primary) return [];

    if (this.mode() === 'single') {
      return [
        { label: `Lingotti di ${primary.label}`, value: armor.ingots },
        { label: `Sangue ${primary.blood}`, value: Math.ceil(armor.ingots / 5) },
      ];
    }

    const secondary = this.secondaryMetal();
    if (!secondary) return [];

    const ingotsPerMetal = Math.ceil(armor.ingots / 2);
    return [
      { label: `Lingotti di ${primary.label}`, value: ingotsPerMetal },
      { label: `Sangue ${primary.blood}`, value: Math.ceil(ingotsPerMetal / 5) },
      { label: `Lingotti di ${secondary.label}`, value: ingotsPerMetal },
      { label: `Sangue ${secondary.blood}`, value: Math.ceil(ingotsPerMetal / 5) },
      { label: `Lingotti d'oro`, value: ingotsPerMetal },
    ];
  });

  bonus = computed(() => {
    const primary = this.primaryMetal();
    if (!primary) return '';

    if (this.mode() === 'single') {
      return this.metalBonus(primary, 42);
    }

    const secondary = this.secondaryMetal();
    if (!secondary) return '';

    return `${this.metalBonus(primary, 24)}, ${this.metalBonus(secondary, 24)}`;
  });

  instructions = computed(() => {
    const primary = this.primaryMetal();
    if (!primary) return [];

    if (this.mode() === 'single') {
      return [
        `Vai da un Alchimista e fai infondere i lingotti di ${primary.label} con il sangue ${primary.blood}.`,
        `Vai da un Fabbro e fatti forgiare l'armatura.`,
      ];
    }

    const secondary = this.secondaryMetal();
    if (!secondary) return [];

    return [
      `Vai da un Alchimista e fai infondere i lingotti di ${primary.label} con il sangue ${primary.blood} e i lingotti di ${secondary.label} con il sangue ${secondary.blood}.`,
      `Vai da un Minatore e fai creare i lingotti della lega ${primary.label} - ${secondary.label} infusa.`,
      `Vai da un Fabbro e fai forgiare l'armatura.`,
    ];
  });

  setArmor(value: string) {
    this.selectedArmorValue.set(value);
  }

  setMode(value: 'single' | 'multi') {
    this.mode.set(value);
    if (value === 'single') {
      this.secondaryMetalLabel.set('');
    }
  }

  setPrimaryMetal(value: string) {
    this.primaryMetalLabel.set(value);
    if (value === this.secondaryMetalLabel()) {
      this.secondaryMetalLabel.set('');
    }
  }

  setSecondaryMetal(value: string) {
    this.secondaryMetalLabel.set(value);
    if (value === this.primaryMetalLabel()) {
      this.primaryMetalLabel.set('');
    }
  }

  private metalBonus(metal: Metal, amount: number) {
    return metal.magres ? `Resistenza ${metal.magres} ${amount}%` : metal.extraLong ?? '';
  }
}

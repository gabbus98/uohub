import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WikiService } from '../../services/wiki.service';
import { AuthService } from '../../services/auth.service';
import { BestiaryComponent } from '../bestiary/bestiary';
import { ToolsLandingComponent } from '../tools-landing/tools-landing';
import { SkillCalcComponent } from '../skill-calc/skill-calc';
import { BbSplitComponent } from '../bb-split/bb-split';
import { RangedWeaponsComponent } from '../ranged-weapons/ranged-weapons';
import { EnchantCostComponent } from '../enchant-cost/enchant-cost';
import { ArmorCostComponent } from '../armor-cost/armor-cost';
import { CreatureAdminComponent } from '../creature-admin/creature-admin';
import { UserAdminComponent } from '../user-admin/user-admin';

@Component({
  selector: 'app-article-view',
  imports: [
    BestiaryComponent,
    ToolsLandingComponent,
    SkillCalcComponent,
    BbSplitComponent,
    RangedWeaponsComponent,
    EnchantCostComponent,
    ArmorCostComponent,
    CreatureAdminComponent,
    UserAdminComponent,
  ],
  templateUrl: './article-view.html'
})
export class ArticleViewComponent implements OnInit {
  wiki = inject(WikiService);
  auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  tocCollapsed = signal(false);

  article = this.wiki.currentArticle;
  currentId = this.wiki.currentArticleId;

  safeBody = computed<SafeHtml>(() => {
    const body = this.article()?.body || '';
    return this.sanitizer.bypassSecurityTrustHtml(body);
  });

  isToolPage = computed(() =>
    this.currentId() === 'tools' || this.currentId().startsWith('tool-')
  );

  displayedToc = computed(() => {
    if (this.currentId() === 'archi-balestre') {
      return [
        { id: 'consulta', label: 'Consulta armi' },
        { id: 'confronto', label: 'Confronto rapido' },
        { id: 'legni', label: 'Legni e Usura' },
      ];
    }

    return this.article()?.toc ?? [];
  });

  ngOnInit() {
    (window as any)['openArticle'] = (id: string) => this.wiki.navigate(id);
    (window as any)['requireGuild'] = (id: string) => {
      if (this.auth.guildAuth()) {
        this.wiki.navigate(id);
      } else {
        this.auth.openModal(id);
      }
    };
  }

  navigate(id: string) {
    this.wiki.navigate(id);
    this.tocCollapsed.set(false);
  }

  toggleToc() {
    this.tocCollapsed.update(v => !v);
  }

  scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

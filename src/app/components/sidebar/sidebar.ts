import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { WikiService, SidebarSection, SidebarItem } from '../../services/wiki.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  wiki = inject(WikiService);
  auth = inject(AuthService);

  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  sections = this.wiki.sidebarSections;
  collapsed = signal<Record<string, boolean>>({});

  toggleSection(label: string) {
    this.collapsed.update(s => ({ ...s, [label]: !s[label] }));
  }

  isSectionCollapsed(label: string) {
    return !!this.collapsed()[label];
  }

  navigate(item: SidebarItem) {
    if (item.guild && !this.auth.guildAuth()) {
      this.auth.openModal(item.id);
    } else {
      this.wiki.navigate(item.id);
    }
    this.close.emit();
  }

  isActive(id: string) {
    return this.wiki.currentArticleId() === id;
  }
}

import { Component, inject, signal, HostListener, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WikiService } from '../../services/wiki.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { SearchResult } from '../../models/article.model';

@Component({
  selector: 'app-header',
  imports: [FormsModule],
  templateUrl: './header.html'
})
export class HeaderComponent {
  wiki = inject(WikiService);
  auth = inject(AuthService);
  theme = inject(ThemeService);

  @Output() sidebarToggle = new EventEmitter<void>();

  searchQuery = signal('');
  searchResults = signal<SearchResult[]>([]);
  showResults = signal(false);

  onSearchInput(q: string) {
    this.searchQuery.set(q);
    if (!q.trim()) { this.searchResults.set([]); this.showResults.set(false); return; }
    const results = this.wiki.search(q);
    this.searchResults.set(results);
    this.showResults.set(true);
  }

  selectResult(id: string) {
    this.wiki.navigate(id);
    this.closeSearch();
  }

  closeSearch() {
    this.showResults.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.search-wrap')) this.showResults.set(false);
  }

  openGuildModal() {
    this.auth.openModal();
  }

  get themeIcon() { return this.theme.theme() === 'dark' ? '☾' : '☀'; }
  get guildLabel() { return this.auth.guildAuth() ? '⚔ Gilda ✓' : '⚔ Gilda'; }
}

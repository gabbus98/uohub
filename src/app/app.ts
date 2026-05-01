import { Component, signal, inject } from '@angular/core';
import { HeaderComponent } from './components/header/header';
import { SidebarComponent } from './components/sidebar/sidebar';
import { ArticleViewComponent } from './components/article-view/article-view';
import { GuildModalComponent } from './components/guild-modal/guild-modal';
import { WikiService } from './services/wiki.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, ArticleViewComponent, GuildModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  wiki = inject(WikiService);
  theme = inject(ThemeService);

  sidebarOpen = signal(false);

  constructor() {
    if (localStorage.getItem('uo-sidebar') === 'closed') {
      document.body.classList.add('sidebar-collapsed');
    }
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen.update(v => !v);
    } else {
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('uo-sidebar', collapsed ? 'closed' : 'open');
    }
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}

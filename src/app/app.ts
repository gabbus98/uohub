import { Component, signal, inject } from '@angular/core';
import { HeaderComponent } from './components/header/header';
import { SidebarComponent } from './components/sidebar/sidebar';
import { ArticleViewComponent } from './components/article-view/article-view';
import { GuildModalComponent } from './components/guild-modal/guild-modal';
import { LoginComponent } from './components/login/login';
import { WikiService } from './services/wiki.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, SidebarComponent, ArticleViewComponent, GuildModalComponent, LoginComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  wiki = inject(WikiService);
  theme = inject(ThemeService);
  auth = inject(AuthService);

  sidebarOpen = signal(false);

  constructor() {
    if (localStorage.getItem('uo-sidebar') !== 'closed') {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
    localStorage.setItem('uo-sidebar', this.sidebarOpen() ? 'open' : 'closed');
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
    localStorage.setItem('uo-sidebar', 'closed');
  }
}

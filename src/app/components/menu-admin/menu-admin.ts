import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MenuSettingsService } from '../../services/menu-settings.service';
import { WikiService } from '../../services/wiki.service';

@Component({
  selector: 'app-menu-admin',
  imports: [FormsModule],
  templateUrl: './menu-admin.html',
})
export class MenuAdminComponent {
  auth = inject(AuthService);
  menus = inject(MenuSettingsService);
  wiki = inject(WikiService);

  saving = signal<Record<string, boolean>>({});
  error = signal('');
  saved = signal('');

  sections = computed(() => this.wiki.allSidebarSections());

  toggle(itemId: string, enabled: boolean) {
    const token = this.auth.token();
    if (!token) return;

    this.saving.update(state => ({ ...state, [itemId]: true }));
    this.error.set('');
    this.saved.set('');
    this.menus.setEnabled(itemId, enabled, token).subscribe({
      next: () => {
        this.menus.load();
        this.saving.update(state => ({ ...state, [itemId]: false }));
        this.saved.set('Menu aggiornato.');
      },
      error: error => {
        this.saving.update(state => ({ ...state, [itemId]: false }));
        this.error.set(error?.error?.message || error?.message || 'Impossibile aggiornare il menu.');
      },
    });
  }

  enabled(itemId: string) {
    return this.menus.isEnabled(itemId);
  }
}

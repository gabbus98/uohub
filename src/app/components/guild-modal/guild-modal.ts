import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { WikiService } from '../../services/wiki.service';

@Component({
  selector: 'app-guild-modal',
  imports: [FormsModule],
  templateUrl: './guild-modal.html'
})
export class GuildModalComponent {
  auth = inject(AuthService);
  wiki = inject(WikiService);

  username = signal('');
  password = signal('');

  doLogin() {
    const ok = this.auth.login(this.username(), this.password());
    if (ok) {
      this.username.set('');
      this.password.set('');
      const pending = this.auth.pendingArticle();
      if (pending) {
        this.wiki.navigate(pending);
        this.auth.pendingArticle.set(null);
      }
    } else {
      this.password.set('');
    }
  }

  closeOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.auth.closeModal();
    }
  }
}

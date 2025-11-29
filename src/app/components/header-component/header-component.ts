import { Component, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/state/auth-service';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-header-component',
    imports: [RouterLink, MatIconModule, MatButtonModule],
    templateUrl: './header-component.html',
    styleUrl: './header-component.scss',
})
export class HeaderComponent {
    auth = inject(AuthService);
  scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }
}

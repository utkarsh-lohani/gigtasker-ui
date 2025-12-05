import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService, ThemeMode } from '../../../core/services/theme/theme-service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-theme-toggle',
    imports: [MatIconModule, MatButtonModule, MatMenuModule],
    templateUrl: './theme-toggle.html',
    styleUrl: './theme-toggle.scss',
})
export class ThemeToggle {
    private readonly themeService = inject(ThemeService);

    set(mode: ThemeMode) {
        this.themeService.setTheme(mode);
    }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CommonModule,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    public authService = inject(AuthService);
    public isLoading = signal(true);

    constructor() {}

    ngOnInit(): void {
        this.authService.initLoginFlow();
        setTimeout(() => {
            this.isLoading.set(false);
        }, 2300);
    }
}

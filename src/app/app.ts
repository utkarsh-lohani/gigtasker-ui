import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {

    public authService = inject(AuthService);

    constructor() {}

    ngOnInit(): void {
        this.authService.initLoginFlow();
    }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WebSocketService } from './core/services/web-socket';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CommonModule,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    public authService = inject(AuthService);
    public isLoading = signal(true);

    private readonly wsService = inject(WebSocketService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        // This effect runs whenever a signal inside it changes.
        effect(() => {
            // We are "watching" this signal
            if (this.authService.isAuthenticated()) {
                // --- The user just logged IN ---
                console.log('User authenticated, connecting to WebSocket...');

                // 1. Connect our "radio" and send the auth token
                this.wsService.connect(this.authService);

                // 2. Start listening to our private "mailbox"
                this.listenForPrivateNotifications();
            } else {
                // --- The user just logged OUT ---
                console.log('User logged out, disconnecting from WebSocket...');
                this.wsService.deactivate(); // Turn off the radio
            }
        });
    }

    ngOnInit(): void {
        // Promise 1: Your "fake" 1-second load
        const fakeLoad = new Promise<void>((resolve) => setTimeout(resolve, 1000));

        // Promise 2: The *real* auth flow, with a safety net
        const authLoad = this.authService.initLoginFlow().catch((err) => {
            console.error('Auth flow failed, but continuing.', err);
        });

        // Wait for BOTH to finish
        Promise.all([fakeLoad, authLoad]).then(() => {
            this.isLoading.set(false);

            // This is the "sledgehammer" fix for our zoneless app
            this.cdr.detectChanges();
        });
    }

    private listenForPrivateNotifications(): void {
        const username = this.authService.getUsername();
        if (!username) {
            console.error("Cannot listen: user 'name' (email) is missing.");
            return;
        }

        const privateChannel = `/user/${username}/queue/notify`;
        console.log('Subscribing to private channel:', privateChannel);

        // We'll call .watch() instead of .watchJson()
        // .watch() returns a "Message" object, and we just read its .body
        this.wsService.watch(privateChannel).subscribe({
            next: (message) => {
                // The message.body is the raw string from the backend
                this.snackBar.open(message.body, 'Awesome!', {
                    duration: 5000,
                    panelClass: ['success-snackbar'],
                });
            },
            error: (err) => console.error(`WS error on ${privateChannel}:`, err),
        });
        // --- END OF FIX ---
    }
}

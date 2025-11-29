import {ChangeDetectorRef, Component, effect, inject, OnInit, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/state/auth-service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {WebSocketService} from './core/services/infra/web-socket-service';
import { HeaderComponent } from './components/header-component/header-component';
import { LandingOverlay } from './components/landing-overlay/landing-overlay';

@Component({
    selector: 'app-root',
    imports: [
    RouterOutlet,
    HeaderComponent,
    LandingOverlay
],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
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
        // Promise 2: The *real* auth flow, with a safety net
        const authLoad = this.authService.initLoginFlow().catch((err) => {
            console.error('Auth flow failed, but continuing.', err);
        });

        // Wait for BOTH to finish
        authLoad.then(() => {
            this.cdr.detectChanges();
            this.isLoading.set(false);
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
    }
}

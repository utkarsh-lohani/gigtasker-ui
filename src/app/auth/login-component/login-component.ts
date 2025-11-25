import { Component, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api-service';
import { AuthService } from '../../core/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-login-component',
    imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
    templateUrl: './login-component.html',
    styleUrl: './login-component.scss',
})
export class LoginComponent {
    private readonly api = inject(ApiService);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);
    private readonly snackBar = inject(MatSnackBar);

    username = '';
    password = '';

    isLoading = signal(false);
    showPassword = signal(false);

    // Tilt signals
    tiltX = signal('0deg');
    tiltY = signal('0deg');

    togglePassword() {
        this.showPassword.update((v) => !v);
    }

    handleTilt(event: MouseEvent) {
        const card = (event.currentTarget as HTMLDivElement).getBoundingClientRect();

        const x = event.clientX - card.left;
        const y = event.clientY - card.top;

        const rotateY = (x / card.width - 0.5) * 10;
        const rotateX = (y / card.height - 0.5) * -10;

        this.tiltX.set(`${rotateX}deg`);
        this.tiltY.set(`${rotateY}deg`);
    }

    resetTilt() {
        this.tiltX.set('0deg');
        this.tiltY.set('0deg');
    }

    login() {
        if (!this.username || !this.password) return;

        this.isLoading.set(true);

        this.api.login(this.username, this.password).subscribe({
            next: (response) => {
                this.auth.saveToken(response);
                this.snackBar.open('Login Successful!', 'OK', { duration: 2000 });
                this.router.navigate(['/dashboard']);
                this.isLoading.set(false);
            },
            error: () => {
                this.snackBar.open('Invalid username or password', 'Close', { duration: 3000 });
                this.isLoading.set(false);
            },
        });
    }
}

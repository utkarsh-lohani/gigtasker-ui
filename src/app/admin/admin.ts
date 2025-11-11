import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { UserDTO } from '../core/models/user.model';
import { ApiService } from '../core/services/api';

@Component({
    selector: 'app-admin',
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './admin.html',
    styleUrl: './admin.scss',
})
export class Admin {
    private readonly apiService = inject(ApiService);
    private readonly snackBar = inject(MatSnackBar);

    // 1. Fetch all users when the admin page loads
    public users = toSignal(this.apiService.getAllUsers());

    public displayedColumns = ['id', 'username', 'email', 'firstName', 'lastName', 'actions'];

    // 2. The "Promote" button's action
    public onPromote(user: UserDTO): void {
        if (confirm(`Are you sure you want to promote ${user.username} to ADMIN?`)) {
            this.apiService.promoteUser(user.id).subscribe({
                next: () => {
                    this.snackBar.open(`${user.username} is now an admin!`, 'OK', {
                        duration: 3000,
                    });
                    // We'd ideally refresh the list here to show their new role
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Failed to promote user.', 'Close', { duration: 3000 });
                },
            });
        }
    }
}

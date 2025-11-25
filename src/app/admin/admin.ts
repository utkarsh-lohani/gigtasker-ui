
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { UserDTO } from '../core/models/user.model';
import { ApiService } from '../core/services/api-service';
import { MatChipsModule } from '@angular/material/chips';
import { RolesDialog } from '../roles-dialog/roles-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-admin',
    imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
],
    templateUrl: './admin.html',
    styleUrl: './admin.scss',
})
export class AdminComponent {
    private readonly apiService = inject(ApiService);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    public users = toSignal(this.apiService.getAllUsers());

    public displayedColumns = [
        'id',
        'username',
        'email',
        'firstName',
        'lastName',
        'roles',
        'actions',
    ];

    public onPromote(user: UserDTO): void {
        if (confirm(`Promote ${user.username} to ADMIN?`)) {
            this.apiService.promoteUser(user.id).subscribe({
                next: () => {
                    this.snackBar.open('User promoted!', 'OK', { duration: 3000 });
                    globalThis.location.reload();
                },
                error: () => this.snackBar.open('Failed to promote.', 'Close', { duration: 3000 }),
            });
        }
    }

    public onDelete(user: UserDTO): void {
        if (confirm(`DELETE ${user.username}?`)) {
            this.apiService.deleteUser(user.id).subscribe({
                next: () => {
                    this.snackBar.open('User deleted.', 'OK', { duration: 3000 });
                    globalThis.location.reload();
                },
                error: () => this.snackBar.open('Failed to delete.', 'Close', { duration: 3000 }),
            });
        }
    }

    public viewRoles(user: UserDTO): void {
        this.dialog.open(RolesDialog, {
            width: '400px',
            data: {
                username: user.username,
                roles: user.roles,
            },
        });
    }
}

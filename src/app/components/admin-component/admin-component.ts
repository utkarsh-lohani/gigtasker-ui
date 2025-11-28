import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { UserDTO } from '../../core/models/user-model';
import { UsersApi } from '../../core/services/api/users-api';
import { RolesDialog } from '../roles-dialog/roles-dialog';

@Component({
    selector: 'app-admin-component',
    imports: [
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatChipsModule,
    ],
    templateUrl: './admin-component.html',
    styleUrl: './admin-component.scss',
})
export class AdminComponent {
    private readonly usersApi = inject(UsersApi);
    private readonly snackBar = inject(MatSnackBar);
    private readonly dialog = inject(MatDialog);

    public users = toSignal(this.usersApi.getAllUsers());

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
            this.usersApi.promoteUser(user.id).subscribe({
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
            this.usersApi.deleteUser(user.id).subscribe({
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

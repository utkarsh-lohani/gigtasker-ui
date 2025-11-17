import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
    selector: 'app-roles-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatListModule,
        MatIconModule,
        MatChipsModule
    ],
    templateUrl: './roles-dialog.html',
    styleUrl: './roles-dialog.scss',
})
export class RolesDialog {
    public dialogRef = inject(MatDialogRef<RolesDialog>);

    // We receive the User's name and their list of roles
    public data: { username: string; roles: string[] } = inject(MAT_DIALOG_DATA);
}

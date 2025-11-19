import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationData } from '../../core/models/confirmation-data.model';

@Component({
    selector: 'app-confirmation-dialog',
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './confirmation-dialog.html',
    styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
    public dialogRef = inject(MatDialogRef<ConfirmationDialog>);
    public data: ConfirmationData = inject(MAT_DIALOG_DATA);
}

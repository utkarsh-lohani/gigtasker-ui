import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskDTO } from '../core/models/task.model';
import { BidsApi } from '../core/services/api/bids-api';

@Component({
    selector: 'app-bid-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
    ],
    templateUrl: './bid-dialog.html',
    styleUrls: ['./bid-dialog.scss'],
})
export class BidDialog {
    private readonly fb = inject(FormBuilder);
    private readonly bidsApi = inject(BidsApi);
    private readonly dialogRef = inject(MatDialogRef<BidDialog>);
    private readonly snackBar = inject(MatSnackBar);
    public data: TaskDTO = inject(MAT_DIALOG_DATA);

    bidForm = this.fb.group({
        amount: [
            '',
            [
                Validators.required,
                Validators.min(this.data.minPay || 1), // Enforce Min
                this.data.maxPay ? Validators.max(this.data.maxPay) : Validators.nullValidator, // Enforce Max if exists
            ],
        ],
        proposal: ['', [Validators.required, Validators.minLength(10)]],
    });

    submit() {
        if (this.bidForm.invalid) return;

        const payload = {
            taskId: this.data.id,
            amount: this.bidForm.value.amount,
            proposal: this.bidForm.value.proposal,
        };

        this.bidsApi.placeBid(payload as any).subscribe({
            next: () => {
                this.snackBar.open('Bid placed successfully!', 'OK', {
                    duration: 3000,
                });
                this.dialogRef.close(true); // Return success
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open(err.error?.message || 'Failed to place bid', 'Close', {
                    duration: 5000,
                });
            },
        });
    }

    close() {
        this.dialogRef.close(false);
    }
}

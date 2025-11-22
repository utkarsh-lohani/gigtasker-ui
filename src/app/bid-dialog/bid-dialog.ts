import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/services/api';

@Component({
    selector: 'app-bid-dialog',
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        ReactiveFormsModule
    ],
    templateUrl: './bid-dialog.html',
    styleUrls: ['./bid-dialog.scss'],
})
export class BidDialog {
    private readonly fb = inject(FormBuilder);
    private readonly apiService = inject(ApiService);
    private readonly snackBar = inject(MatSnackBar);

    // This gives us a reference to the dialog *itself*
    public dialogRef = inject(MatDialogRef<BidDialog>);

    // This is how we get data *into* the dialog
    public data: { taskId: number } = inject(MAT_DIALOG_DATA);

    public bidForm = this.fb.group({
        amount: [null as number | null, [Validators.required, Validators.min(1)]],
        proposal: ['', Validators.required], // Your new field!
    });

    public submitBid(): void {
        if (this.bidForm.invalid) {
            return;
        }

        const { amount, proposal } = this.bidForm.value;

        this.apiService.placeBid(this.data.taskId, amount!, proposal!).subscribe({
            next: (bid) => {
                this.snackBar.open(`Bid of $${bid.amount} placed successfully!`, 'OK', {
                    duration: 3000,
                });
                this.dialogRef.close(true); // Close the dialog and send back "success"
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Failed to place bid.', 'Close', { duration: 3000 });
            },
        });
    }
}

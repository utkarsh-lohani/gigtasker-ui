import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../core/api';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-view-bids-dialog',
    imports: [
        CommonModule,
        MatDialogModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './view-bids-dialog.html',
    styleUrl: './view-bids-dialog.scss',
})
export class ViewBidsDialog {
    private readonly apiService = inject(ApiService);
    public data: { taskId: number } = inject(MAT_DIALOG_DATA);
    private readonly router = inject(Router);
    private readonly snackBar = inject(MatSnackBar);
    public dialogRef = inject(MatDialogRef<ViewBidsDialog>);

    // Fetch the bids *inside* the dialog when it's created
    public bids = toSignal(this.apiService.getBidDetailsForTask(this.data.taskId));

    public acceptBid(bidId: number): void {
        this.apiService.acceptBid(bidId).subscribe({
            next: () => {
                this.snackBar.open('Bid accepted! The gig is now assigned.', 'OK', {
                    duration: 5000,
                });
                this.dialogRef.close(); // Close the popup

                // This is the simplest way to see the result
                // (the TaskListComponent will re-fetch)
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open(err.error || 'Failed to accept bid.', 'Close', {
                    duration: 5000,
                });
            },
        });
    }
}

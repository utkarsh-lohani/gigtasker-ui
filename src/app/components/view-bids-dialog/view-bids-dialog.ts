import {Component, inject, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {WebSocketService} from '../../core/services/infra/web-socket';
import {BidDetailDTO, BidDTO} from '../../core/models/bid.model';
import {BidsApi} from '../../core/services/api/bids-api';

@Component({
    selector: 'app-view-bids-dialog',
    imports: [
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
],
    templateUrl: './view-bids-dialog.html',
    styleUrl: './view-bids-dialog.scss',
})
export class ViewBidsDialog implements OnInit {
    private readonly bidsApi = inject(BidsApi);
    public data: { taskId: number } = inject(MAT_DIALOG_DATA);
    private readonly router = inject(Router);
    private readonly snackBar = inject(MatSnackBar);
    private readonly wsService = inject(WebSocketService);
    public dialogRef = inject(MatDialogRef<ViewBidsDialog>);

    // Fetch the bids *inside* the dialog when it's created
    public bids = signal<BidDetailDTO[] | undefined>(undefined);
    public isLoading = signal(true);

    ngOnInit(): void {
        this.loadBids();

        const topic = `/topic/task/${this.data.taskId}/bids`;
        this.wsService.watchJson<BidDTO>(topic).subscribe({
            next: (newBid) => {
                console.log('LIVE BID RECEIVED!', newBid);
                this.snackBar.open(`New bid from ${newBid.bidderUserId}!`, 'Reloading...', {
                    duration: 2000,
                });

                // Just re-fetch the whole list. This is the simplest,
                // most robust way to get the new, "data-zipped" list.
                this.loadBids();
            },
            error: (err) => console.error(`WS error on ${topic}:`, err),
        });
    }

    public loadBids(): void {
        this.isLoading.set(true);
        this.bidsApi.getBidsForTask(this.data.taskId).subscribe({
            next: (data) => {
                this.bids.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            },
        });
    }

    public acceptBid(bidId: number): void {
        this.bidsApi.acceptBid(bidId).subscribe({
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

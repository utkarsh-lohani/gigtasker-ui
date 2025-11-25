import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api-service';
import { BidDialog } from '../bid-dialog/bid-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskDTO } from '../core/models/task.model';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { BidDetailDTO } from '../core/models/bid.model';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-task-detail',
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
        MatListModule,
    ],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.scss',
})
export class TaskDetail implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly api = inject(ApiService);
    public readonly auth = inject(AuthService);
    private readonly dialog = inject(MatDialog);
    private readonly snack = inject(MatSnackBar);

    task = signal<TaskDTO | null>(null);
    bids = signal<BidDetailDTO[]>([]);

    // Derived state helpers
    isPoster = signal(false);
    isAssignedWorker = signal(false);
    isLoading = signal(true);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadTask(Number(id));
        }
    }

    loadTask(id: number) {
        this.isLoading.set(true);
        this.api.getTaskById(id).subscribe({
            next: (t) => {
                this.task.set(t);
                this.checkPermissions(t);

                // If I am the poster, load the bids
                if (this.isPoster() && t.status === 'OPEN') {
                    this.loadBids(t.id);
                }
                this.isLoading.set(false);
            },
            error: () => {
                this.snack.open('Task not found', 'Back');
                this.router.navigate(['/dashboard']);
            },
        });
    }

    checkPermissions(task: TaskDTO) {
        this.api.getMe().subscribe((me) => {
            this.isPoster.set(me.id === task.posterUserId);
            this.isAssignedWorker.set(me.id === task.assignedUserId);
        });
    }

    loadBids(taskId: number) {
        this.api.getBidsForTask(taskId).subscribe((b) => this.bids.set(b));
    }

    openBidDialog() {
        const dialogRef = this.dialog.open(BidDialog, {
            width: '500px',
            data: this.task(),
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.loadTask(this.task()!.id); // Refresh to see update count
        });
    }

    acceptBid(bid: BidDetailDTO) {
        if (!confirm(`Accept bid for $${bid.amount}? This will hold funds from your wallet.`))
            return;

        this.api.acceptBid(bid.bidId).subscribe({
            next: () => {
                this.snack.open('Bid Accepted! Funds held in escrow.', 'OK', { duration: 5000 });
                this.loadTask(this.task()!.id); // Status should change to ASSIGNED
            },
            error: (err) => {
                // Handle "Insufficient Funds" specific error
                const msg = err.error?.message || 'Failed to accept bid.';
                this.snack.open(msg, 'Close', { duration: 5000 });
            },
        });
    }

    completeTask() {
        if (!confirm('Mark this job as done? This will release payment.')) return;

        this.api.completeTask(this.task()!.id).subscribe({
            next: () => {
                this.snack.open('Great job! Payment released to your wallet.', 'Cha-ching!', {
                    duration: 5000,
                });
                this.loadTask(this.task()!.id);
            },
            error: () => this.snack.open('Error completing task', 'Close'),
        });
    }
}

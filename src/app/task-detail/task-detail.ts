import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { switchMap, map } from 'rxjs/operators'; // Import RxJS operators
import { BidDialog } from '../bid-dialog/bid-dialog';
import { BidDetailDTO } from '../core/models/bid.model';
import { TaskDTO } from '../core/models/task.model';
import { ApiService } from '../core/services/api-service';
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

        // Chain the requests: Get Task -> Then Get User -> Then Decide logic
        this.api
            .getTaskById(id)
            .pipe(
                switchMap((task) => {
                    this.task.set(task);
                    // Fetch current user to check permissions
                    return this.api.getMe().pipe(map((me) => ({ task, me })));
                })
            )
            .subscribe({
                next: ({ task, me }) => {
                    // 1. Determine Permissions
                    const isPoster = me.id === task.posterUserId;
                    this.isPoster.set(isPoster);
                    this.isAssignedWorker.set(me.id === task.assignedUserId);

                    // 2. Load Bids ONLY if I am the poster and task is OPEN
                    // (Now guaranteed to work because we waited for 'me')
                    if (isPoster && task.status === 'OPEN') {
                        this.loadBids(task.id);
                    }

                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error(err);
                    this.snack.open('Task not found', 'Back');
                    this.router.navigate(['/dashboard']);
                    this.isLoading.set(false);
                },
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
            // Refresh task if bid placed successfully
            if (result) this.loadTask(this.task()!.id);
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

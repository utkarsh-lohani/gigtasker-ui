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
import { map, switchMap } from 'rxjs/operators';
import { BidDialog } from '../bid-dialog/bid-dialog';
import { BidDetailDTO } from '../../core/models/bids-model';
import { TaskDTO } from '../../core/models/task-model';
import { TasksApi } from '../../core/services/api/tasks-api';
import { UsersApi } from '../../core/services/api/users-api';
import { BidsApi } from '../../core/services/api/bids-api';
import { ReviewDialog } from '../review-dialog/review-dialog';

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
    private readonly tasksApi = inject(TasksApi);
    private readonly bidsApi = inject(BidsApi);
    private readonly usersApi = inject(UsersApi);
    private readonly dialog = inject(MatDialog);
    private readonly snack = inject(MatSnackBar);

    tiltX = signal('0deg');
    tiltY = signal('0deg');

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

    handleTilt(event: MouseEvent) {
        const card = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const x = event.clientX - card.left;
        const y = event.clientY - card.top;

        const rotateX = ((y - card.height / 2) / 20) * -1;
        const rotateY = (x - card.width / 2) / 20;

        this.tiltX.set(`${rotateX}deg`);
        this.tiltY.set(`${rotateY}deg`);
    }

    resetTilt() {
        this.tiltX.set('0deg');
        this.tiltY.set('0deg');
    }

    loadTask(id: number) {
        this.isLoading.set(true);

        // Chain the requests: Get Task -> Then Get User -> Then Decide logic
        this.tasksApi
            .getTaskById(id)
            .pipe(
                switchMap((task) => {
                    this.task.set(task);
                    // Fetch current user to check permissions
                    return this.usersApi.getMe().pipe(map((me) => ({ task, me })));
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
        this.bidsApi.getBidsForTask(taskId).subscribe((b) => this.bids.set(b));
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

        this.bidsApi.acceptBid(bid.bidId).subscribe({
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

        this.tasksApi.completeTask(this.task()!.id).subscribe({
            next: () => {
                this.snack.open('Great job! Payment released to your wallet.', 'Cha-ching!', {
                    duration: 5000,
                });
                this.loadTask(this.task()!.id);
            },
            error: () => this.snack.open('Error completing task', 'Close'),
        });
    }

    cancelTask() {
        if (!confirm('Are you sure you want to cancel? If assigned, funds will be refunded.'))
            return;

        this.tasksApi.cancelTask(this.task()!.id).subscribe({
            next: () => {
                this.snack.open('Task Cancelled', 'OK', { duration: 3000 });
                this.router.navigate(['/dashboard']); // Go back to list
            },
            error: () => this.snack.open('Failed to cancel task', 'Close'),
        });
    }

    openReviewDialog() {
        const task = this.task();
        if (!task) return;

        const targetUserId = this.isPoster() ? task.assignedUserId : task.posterUserId;

        if (!targetUserId) return;

        this.usersApi.getUserById(targetUserId).subscribe({
            next: (u) => {
                this.dialog.open(ReviewDialog, {
                    width: '500px',
                    data: {
                        taskId: task.id,
                        revieweeId: u.keycloakId,
                    },
                });
            },
            error: () => this.snack.open('Could not find user details', 'Close'),
        });
    }

    contactUser() {
        const task = this.task();
        if (!task) return;

        // Determine who to talk to (The "Other" person)
        let targetUserId = task.posterUserId;
        if (this.isPoster() && task.assignedUserId) {
            targetUserId = task.assignedUserId;
        }

        // We need the UUID for the Chat Service
        this.usersApi.getUserById(targetUserId).subscribe((u) => {
            this.router.navigate(['/dashboard'], {
                queryParams: {
                    tab: 'chat',
                    taskId: task.id,
                    targetId: u.keycloakId,
                    targetName: u.username,
                },
            });
        });
    }
}

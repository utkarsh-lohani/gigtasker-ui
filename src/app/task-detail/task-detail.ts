import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/services/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { BidDialog } from '../bid-dialog/bid-dialog';
import { MatDialog } from '@angular/material/dialog';
import { ViewBidsDialog } from '../view-bids-dialog/view-bids-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskStatusEnum } from '../core/models/task.model';

@Component({
    selector: 'app-task-detail',
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatButtonModule,
    ],
    templateUrl: './task-detail.html',
    styleUrl: './task-detail.scss',
})
export class TaskDetail {
    private readonly route = inject(ActivatedRoute);
    private readonly apiService = inject(ApiService);
    private readonly router = inject(Router);
    private readonly snackBar = inject(MatSnackBar);
    public dialog = inject(MatDialog);

    // This is a "reactive" signal
    // 1. It watches the URL for the 'id' param.
    // 2. It uses switchMap to "switch" to a new API call.
    // 3. toSignal() converts the resulting task into our data.
    private readonly task$ = this.route.paramMap.pipe(
        switchMap((params) => {
            const id = Number(params.get('id'));
            return this.apiService.getTaskById(id);
        })
    );

    public task = toSignal(this.task$);

    public poster = toSignal(
        this.task$.pipe(
            // As soon as the task comes in...
            filter((task): task is any => !!task), // Filter out any undefined
            // ...switch to a *new* API call to get the user
            switchMap((task) => this.apiService.getUserById(task.posterUserId))
        )
    );

    public currentUser = toSignal(this.apiService.getMe());

    public isOwner = computed(() => {
        const t = this.task();
        const u = this.currentUser();
        if (!t || !u) return false;
        return t.posterUserId === u.id;
    });

    public openBidDialog(): void {
        const task = this.task();
        if (!task) return; // Shouldn't happen, but good to check

        this.dialog.open(BidDialog, {
            width: '500px',
            data: { taskId: task.id }, // Pass the Task ID to the dialog
        });
    }

    public openViewBidsDialog(): void {
        const taskId = this.task()?.id;
        if (!taskId) return;

        this.dialog.open(ViewBidsDialog, {
            width: '600px',
            data: { taskId: taskId }, // Pass in the task ID
        });
    }

    public isWorker = computed(() => {
        const t = this.task();
        const u = this.currentUser();

        // Safety check: Data must exist
        if (!t || !u) return false;

        // Logic: The task must be ASSIGNED, and the assignedUserId must match ME.
        return t.status === TaskStatusEnum.ASSIGNED && t.posterUserId !== u.id && t.assignedUserId === u.id;
    });

    public markAsCompleted(): void {
        const t = this.task();
        if (!t) return;

        if (confirm('Are you sure you want to mark this gig as finished?')) {
            this.apiService.completeTask(t.id).subscribe({
                next: () => {
                    this.snackBar.open('Gig marked as COMPLETED! Great job.', 'OK', {
                        duration: 5000,
                    });
                    globalThis.location.reload();
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Failed to complete task.', 'Close', { duration: 3000 });
                },
            });
        }
    }
}

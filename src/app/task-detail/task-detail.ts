import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, switchMap } from 'rxjs';
import { BidDialog } from '../bid-dialog/bid-dialog';
import { MatDialog } from '@angular/material/dialog';

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

    public openBidDialog(): void {
        const task = this.task();
        if (!task) return; // Shouldn't happen, but good to check

        this.dialog.open(BidDialog, {
            width: '500px',
            data: { taskId: task.id }, // Pass the Task ID to the dialog
        });
    }
}

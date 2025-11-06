import { CommonModule } from '@angular/common';
import { Component, effect, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { ApiService } from '../core/api';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { CreateTask } from '../create-task/create-task';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskList } from '../task-list/task-list';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskDTO } from '../core/models/task.model';

@Component({
    selector: 'app-dashboard',
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        CreateTask,
        TaskList,
        MatProgressSpinnerModule,
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class Dashboard {
    private readonly apiService = inject(ApiService);

    public user = toSignal(this.apiService.getMe());

    // This grabs *all* <app-task-list> components in our template
    @ViewChildren(TaskList) taskLists!: QueryList<TaskList>;

    // We create writable signals for our data
    public allTasks = signal<TaskDTO[] | undefined>(undefined);
    public myTasks = signal<TaskDTO[] | undefined>(undefined);

    // We also create signals for *their* loading states
    public allTasksLoading = signal(true);
    public myTasksLoading = signal(true);

    public selectedTabIndex = signal(0);

    constructor() {
        // Use an effect() to react to tab changes
        effect(
            () => {
                if (this.selectedTabIndex() === 0 && !this.allTasks()) {
                    this.loadAllTasks();
                }

                if (this.selectedTabIndex() === 1 && this.user() && !this.myTasks()) {
                    this.loadMyTasks();
                }
                // ---
            },
            { allowSignalWrites: true }
        );
    }

    // This method is called by the (taskCreated) event
    public refreshTaskLists(): void {
        // We just re-run the *specific* loads
        this.loadAllTasks();
        if (this.user()) {
            this.loadMyTasks();
        }
    }

    private loadAllTasks(): void {
        this.allTasksLoading.set(true);
        this.apiService.getAllTasks().subscribe({
            next: (data) => {
                this.allTasks.set(data);
                this.allTasksLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.allTasksLoading.set(false);
            },
        });
    }

    private loadMyTasks(): void {
        const userId = this.user()?.id;
        if (!userId) return; // Safety check

        this.myTasksLoading.set(true);
        this.apiService.getTasksByUserId(userId).subscribe({
            next: (data) => {
                this.myTasks.set(data);
                this.myTasksLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.myTasksLoading.set(false);
            },
        });
    }
}

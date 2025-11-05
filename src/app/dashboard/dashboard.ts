import { CommonModule } from '@angular/common';
import { Component, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { ApiService } from '../core/api';
import { toSignal } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { CreateTask } from '../create-task/create-task';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskList } from '../task-list/task-list';
import { MatTabsModule } from '@angular/material/tabs';

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

    public selectedTabIndex = signal(0);

    public refreshTaskLists(): void {
        if (this.taskLists) {
            for (const element of this.taskLists) {
                element.loadTasks();
            }
        }
    }
}

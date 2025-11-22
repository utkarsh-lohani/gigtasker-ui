
import { Component, inject, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { TaskDTO } from '../core/models/task.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-task-list',
    imports: [MatTableModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
})
export class TaskList {
    private readonly router = inject(Router);

    @Input() tasks: TaskDTO[] | undefined;
    @Input() isLoading: boolean = true;

    // This tells the table which columns to show and in what order
    public displayedColumns: string[] = ['sno', 'id', 'title', 'status', 'actions'];

    public viewTask(taskId: number): void {
        this.router.navigate(['/tasks', taskId]);
    }
}

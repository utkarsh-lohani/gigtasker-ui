import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../core/api';
import { TaskDTO } from '../core/models/task.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-task-list',
    imports: [CommonModule, MatTableModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
})
export class TaskList implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly router = inject(Router);

    @Input() userId: number | undefined;

    // We will add a "loading" signal to control the spinner
    public tasks = signal<TaskDTO[] | undefined>(undefined);
    public isLoading = signal(true);

    // This tells the table which columns to show and in what order
    public displayedColumns: string[] = ['sno', 'id', 'title', 'status', 'actions'];

    ngOnInit(): void {
        this.loadTasks();
    }

    // This is our data-loading function
    public loadTasks(): void {
        this.isLoading.set(true); // Show spinner
        this.tasks.set(undefined); // Clear old data

        // Check if we're in "My Tasks" mode or "All Tasks" mode
        const source = this.userId
            ? this.apiService.getTasksByUserId(this.userId)
            : this.apiService.getAllTasks();

        source.subscribe({
            next: (data) => {
                this.tasks.set(data); // Set data
                this.isLoading.set(false); // Hide spinner
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false); // Hide spinner on error
            },
        });
    }

    public viewTask(taskId: number): void {
        this.router.navigate(['/tasks', taskId]);
    }
}

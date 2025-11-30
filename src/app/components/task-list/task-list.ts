import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TaskDTO } from '../../core/models/task-model';
import { SearchFilters } from '../../core/models/search-filter-model';

@Component({
    selector: 'app-task-list',
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
    ],
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
})
export class TaskList {
    private readonly router = inject(Router);

    @Input() tasks: TaskDTO[] | undefined;
    @Input() isLoading: boolean = true;

    // New: Enable search bar only for "All Gigs" tab
    @Input() showSearch: boolean = false;

    // New: Emit event when user searches
    @Output() searchValue = new EventEmitter<SearchFilters>();

    // Search State (Local to UI)
    searchQuery = '';
    minPrice: number | null = null;
    maxPrice: number | null = null;

    public displayedColumns: string[] = ['sno', 'title', 'budget', 'status', 'actions'];

    public viewTask(taskId: number): void {
        this.router.navigate(['/dashboard'], { queryParams: { tab: 'task', id: taskId } });
        // Or your existing route: this.router.navigate(['/tasks', taskId]);
    }

    public triggerSearch(): void {
        this.searchValue.emit({
            query: this.searchQuery,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
        });
    }

    public clearSearch(): void {
        this.searchQuery = '';
        this.minPrice = null;
        this.maxPrice = null;
        this.triggerSearch();
    }
}

import { Component, effect, inject, QueryList, signal, ViewChildren } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { CreateTask } from '../create-task/create-task';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskList } from '../task-list/task-list';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskDTO } from '../core/models/task.model';
import { MyBids } from '../my-bids/my-bids';
import { MyBidDetailDTO } from '../core/models/bid.model';
import { WebSocketService } from '../core/services/infra/web-socket';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { WalletComponent } from '../wallet-component/wallet-component';
import { UsersApi } from '../core/services/api/users-api';
import { TasksApi } from '../core/services/api/tasks-api';
import { BidsApi } from '../core/services/api/bids-api';

@Component({
    selector: 'app-dashboard',
    imports: [MatCardModule, MatTabsModule, CreateTask, TaskList, MatProgressSpinnerModule, MyBids, MatIconModule, WalletComponent],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class Dashboard {
    private readonly usersApi = inject(UsersApi);
    private readonly tasksApi = inject(TasksApi);
    private readonly bidsApi = inject(BidsApi);
    private readonly wsService = inject(WebSocketService);

    public user = toSignal(this.usersApi.getMe());

    // This grabs *all* <app-task-list> components in our template
    @ViewChildren(TaskList) taskLists!: QueryList<TaskList>;

    // We create writable signals for our data
    public allTasks = signal<TaskDTO[] | undefined>(undefined);
    public myTasks = signal<TaskDTO[] | undefined>(undefined);
    public myBids = signal<MyBidDetailDTO[] | undefined>(undefined);

    // We also create signals for *their* loading states
    public allTasksLoading = signal(true);
    public myTasksLoading = signal(true);
    public myBidsLoading = signal(false);

    public selectedTabIndex = signal(0);

    private readonly dialog = inject(MatDialog);

    openCreateTaskDialog() {
        this.dialog.open(CreateTask, {
            width: '600px',
            disableClose: true,
        });
    }

    onTabChange(index: number) {
        this.selectedTabIndex.set(index);
    }

    constructor() {
        // This effect runs when selectedTabIndex or user() changes
        effect(() => {
            const tabIndex = this.selectedTabIndex();
            const currentUser = this.user(); // Get the user value

            // 1. "All Gigs" tab is clicked
            if (tabIndex === 0 && !this.allTasks()) {
                this.loadAllTasks();
            }

            // 2. "My Gigs" tab is clicked
            if (tabIndex === 1 && currentUser && !this.myTasks()) {
                this.loadMyTasks();
            }

            // 3. "My Bids" tab is clicked
            if (tabIndex === 2 && currentUser && !this.myBids()) {
                this.loadMyBids();
            }
        });

        this.listenForNewTasks();
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
        this.tasksApi.getAllTasks().subscribe({
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
        this.tasksApi.getTasksByUserId(userId).subscribe({
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

    private loadMyBids(): void {
        this.myBidsLoading.set(true);
        this.bidsApi.getMyBids().subscribe({
            next: (data) => {
                this.myBids.set(data);
                this.myBidsLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.myBidsLoading.set(false);
            },
        });
    }

    private listenForNewTasks(): void {
        this.wsService.watchJson<TaskDTO>('/topic/tasks').subscribe({
            next: (newTask) => {
                // A new task just came in
                // We'll just add it to the top of our "All Tasks" list.
                this.allTasks.update((currentTasks) => {
                    // Add the new task to the beginning of the list
                    return [newTask, ...(currentTasks || [])];
                });
            },
            error: (err) => console.error('WS error on /topic/tasks:', err),
        });
    }
}

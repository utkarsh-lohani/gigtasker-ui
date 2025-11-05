import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

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

    // This is a "reactive" signal
    // 1. It watches the URL for the 'id' param.
    // 2. It uses switchMap to "switch" to a new API call.
    // 3. toSignal() converts the resulting task into our data.
    public task = toSignal(
        this.route.paramMap.pipe(
            switchMap((params) => {
                const id = Number(params.get('id'));
                return this.apiService.getTaskById(id);
            })
        )
    );
}

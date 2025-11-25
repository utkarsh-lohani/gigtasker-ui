import { inject, Injectable } from '@angular/core';
import { GigtaskerConstants } from '../constant';
import { Observable } from 'rxjs';
import { TaskDTO } from '../../models/task.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class TasksApi {
    private readonly http = inject(HttpClient);

    public createTask(task: Partial<TaskDTO>): Observable<TaskDTO> {
        return this.http.post<TaskDTO>(`${GigtaskerConstants.API_URL}/api/tasks`, task);
    }

    public getAllTasks(): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${GigtaskerConstants.API_URL}/api/tasks`);
    }

    public getTasksByUserId(userId: number): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${GigtaskerConstants.API_URL}/api/tasks/user/${userId}`);
    }

    public getTaskById(taskId: number): Observable<TaskDTO> {
        return this.http.get<TaskDTO>(`${GigtaskerConstants.API_URL}/api/tasks/${taskId}`);
    }

    public completeTask(taskId: number): Observable<void> {
        return this.http.put<void>(
            `${GigtaskerConstants.API_URL}/api/tasks/${taskId}/complete`,
            {}
        );
    }

    public cancelTask(taskId: number): Observable<void> {
        return this.http.delete<void>(`${GigtaskerConstants.API_URL}/api/tasks/${taskId}`);
    }
}

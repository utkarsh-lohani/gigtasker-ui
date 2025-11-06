import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from './models/user.model';
import { TaskDTO } from './models/task.model';
import { BidDetailDTO, BidDTO } from './models/bid.model';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly http = inject(HttpClient);

    // This is our API Gateway's address
    private readonly API_URL = 'http://localhost:9090';

    public getMe(): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.API_URL}/api/users/me`);
    }

    public getUserById(id: number): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.API_URL}/api/users/${id}`);
    }

    public createTask(taskData: Partial<TaskDTO>): Observable<TaskDTO> {
        return this.http.post<TaskDTO>(`${this.API_URL}/api/tasks`, taskData);
    }

    public getAllTasks(): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${this.API_URL}/api/tasks`);
    }

    public getTasksByUserId(userId: number): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${this.API_URL}/api/tasks/user/${userId}`);
    }

    public getTaskById(id: number): Observable<TaskDTO> {
        return this.http.get<TaskDTO>(`${this.API_URL}/api/tasks/${id}`);
    }

    public placeBid(taskId: number, amount: number, proposal: string): Observable<BidDTO> {
        const bidRequest = {
            taskId: taskId,
            amount: amount,
            proposal: proposal,
        };
        return this.http.post<BidDTO>(`${this.API_URL}/api/bids`, bidRequest);
    }

    public getBidDetailsForTask(taskId: number): Observable<BidDetailDTO[]> {
        return this.http.get<BidDetailDTO[]>(`${this.API_URL}/api/bids/task/${taskId}`);
    }

    public acceptBid(bidId: number): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/api/bids/${bidId}/accept`, {});
    }
}

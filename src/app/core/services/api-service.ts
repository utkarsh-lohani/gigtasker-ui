import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDTO } from '../models/task.model';
import { UserDTO } from '../models/user.model';
import { BidDTO, BidDetailDTO, MyBidDetailDTO } from '../models/bid.model';
import { Wallet, WalletTransaction } from '../models/wallet.model';
import { Country } from '../models/country-region.model';
import { Gender } from '../models/gender.model';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:9090';

    // --- AUTHENTICATION ---

    public register(payload: any): Observable<UserDTO> {
        return this.http.post<UserDTO>(`${this.API_URL}/api/auth/register`, payload);
    }

    public login(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/api/auth/login`, { username, password });
    }

    public refreshToken(refreshToken: string): Observable<any> {
        return this.http.post<any>(`${this.API_URL}/api/auth/refresh`, { refreshToken });
    }

    // --- REFERENCE DATA (Public) ---

    public getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${this.API_URL}/api/references/countries`);
    }

    public getGenders(): Observable<Gender[]> {
        return this.http.get<Gender[]>(`${this.API_URL}/api/references/genders`);
    }

    // --- USERS ---

    public getMe(): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${this.API_URL}/api/users/me`);
    }

    public getAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.API_URL}/api/users`);
    }

    public promoteUser(userId: number): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/api/users/${userId}/promote`, {});
    }

    public deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/api/users/${userId}`);
    }

    // --- TASKS ---

    public createTask(task: Partial<TaskDTO>): Observable<TaskDTO> {
        return this.http.post<TaskDTO>(`${this.API_URL}/api/tasks`, task);
    }

    public getAllTasks(): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${this.API_URL}/api/tasks`);
    }

    public getTasksByUserId(userId: number): Observable<TaskDTO[]> {
        return this.http.get<TaskDTO[]>(`${this.API_URL}/api/tasks/user/${userId}`);
    }

    public getTaskById(taskId: number): Observable<TaskDTO> {
        return this.http.get<TaskDTO>(`${this.API_URL}/api/tasks/${taskId}`);
    }

    public completeTask(taskId: number): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/api/tasks/${taskId}/complete`, {});
    }

    // --- BIDS ---

    public placeBid(bid: BidDTO): Observable<BidDTO> {
        return this.http.post<BidDTO>(`${this.API_URL}/api/bids`, bid);
    }

    public getBidsForTask(taskId: number): Observable<BidDetailDTO[]> {
        return this.http.get<BidDetailDTO[]>(`${this.API_URL}/api/bids/task/${taskId}`);
    }

    public acceptBid(bidId: number): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/api/bids/${bidId}/accept`, {});
    }

    public getMyBids(): Observable<MyBidDetailDTO[]> {
        return this.http.get<MyBidDetailDTO[]>(`${this.API_URL}/api/bids/my-bids`);
    }

    // --- WALLET ---

    public getMyWallet(): Observable<Wallet> {
        return this.http.get<Wallet>(`${this.API_URL}/api/wallet`);
    }

    public depositFunds(amount: number): Observable<Wallet> {
        return this.http.post<Wallet>(`${this.API_URL}/api/wallet/deposit`, amount);
    }

    public getWalletHistory(): Observable<WalletTransaction[]> {
        return this.http.get<WalletTransaction[]>(`${this.API_URL}/api/wallet/transactions`);
    }
}

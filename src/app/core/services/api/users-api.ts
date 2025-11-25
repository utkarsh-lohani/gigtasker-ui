import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDTO } from '../../models/user.model';
import { GigtaskerConstants } from '../constant';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class UsersApi {
    private readonly http = inject(HttpClient);

    public getMe(): Observable<UserDTO> {
        return this.http.get<UserDTO>(`${GigtaskerConstants.API_URL}/api/users/me`);
    }

    public getAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${GigtaskerConstants.API_URL}/api/users`);
    }

    public promoteUser(userId: number): Observable<void> {
        return this.http.post<void>(`${GigtaskerConstants.API_URL}/api/users/${userId}/promote`, {});
    }

    public deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${GigtaskerConstants.API_URL}/api/users/${userId}`);
    }
}

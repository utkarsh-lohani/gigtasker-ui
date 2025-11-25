import { inject, Injectable } from '@angular/core';
import { GigtaskerConstants } from '../constant';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDTO } from '../../models/user.model';

@Injectable({
    providedIn: 'root',
})
export class AuthApi {
    private readonly http = inject(HttpClient);

    public register(payload: any): Observable<UserDTO> {
        return this.http.post<UserDTO>(`${GigtaskerConstants.API_URL}/api/auth/register`, payload);
    }

    public login(username: string, password: string): Observable<any> {
        return this.http.post<any>(`${GigtaskerConstants.API_URL}/api/auth/login`, {
            username,
            password,
        });
    }

    public refreshToken(refreshToken: string): Observable<any> {
        return this.http.post<any>(`${GigtaskerConstants.API_URL}/api/auth/refresh`, {
            refreshToken,
        });
    }
}

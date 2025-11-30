import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GigtaskerConstants } from '../constant';

@Injectable({
    providedIn: 'root',
})
export class SearchApi {
    private readonly http = inject(HttpClient);

    public searchTasks(
        query: string,
        minPay: number,
        maxPay: number,
        // distance: string
    ): Observable<any> {
        // Calls search-service via Gateway
        return this.http.get(`${GigtaskerConstants.API_URL}/api/search/tasks`, {
            params: {
                query: query || '',
                minPay: minPay || 0,
                maxPay: maxPay || 10000,
                // lat/lon would go here too if we had geolocation
            },
        });
    }
}

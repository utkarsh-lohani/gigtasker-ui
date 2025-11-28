import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ReviewDTO } from '../../models/review-model';
import { HttpClient } from '@angular/common/http';
import { GigtaskerConstants } from '../constant';

@Injectable({
    providedIn: 'root',
})
export class ReviewsApi {

    private readonly http = inject(HttpClient);

    public postReview(payload: any): Observable<ReviewDTO> {
        return this.http.post<ReviewDTO>(`${GigtaskerConstants.API_URL}/api/reviews`, payload);
    }

    public getUserReviews(userId: string): Observable<ReviewDTO[]> {
        return this.http.get<ReviewDTO[]>(`${GigtaskerConstants.API_URL}/api/reviews/user/${userId}`);
    }

    public getUserRating(userId: string): Observable<number> {
        return this.http.get<number>(`${GigtaskerConstants.API_URL}/api/reviews/user/${userId}/rating`);
    }
}

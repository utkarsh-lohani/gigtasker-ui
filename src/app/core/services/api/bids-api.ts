import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BidDetailDTO, BidDTO, MyBidDetailDTO} from '../../models/bids-model';
import {HttpClient} from '@angular/common/http';
import {GigtaskerConstants} from '../constant';

@Injectable({
    providedIn: 'root',
})
export class BidsApi {
    private readonly http = inject(HttpClient);

    public placeBid(bid: BidDTO): Observable<BidDTO> {
        return this.http.post<BidDTO>(`${GigtaskerConstants.API_URL}/api/bids`, bid);
    }

    public getBidsForTask(taskId: number): Observable<BidDetailDTO[]> {
        return this.http.get<BidDetailDTO[]>(`${GigtaskerConstants.API_URL}/api/bids/task/${taskId}`);
    }

    public acceptBid(bidId: number): Observable<void> {
        return this.http.post<void>(`${GigtaskerConstants.API_URL}/api/bids/${bidId}/accept`, {});
    }

    public getMyBids(): Observable<MyBidDetailDTO[]> {
        return this.http.get<MyBidDetailDTO[]>(`${GigtaskerConstants.API_URL}/api/bids/my-bids`);
    }
}

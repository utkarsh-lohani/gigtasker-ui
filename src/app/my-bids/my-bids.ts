import { Component, Input } from '@angular/core';
import { MyBidDetailDTO } from '../core/models/bid.model';
import { CommonModule, NgClass, TitleCasePipe } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-my-bids',
    imports: [
        CommonModule,
        RouterLink,
        NgClass, // For [ngClass] on the chips
        TitleCasePipe, // For the | titlecase pipe
        MatTableModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatIconModule,
    ],
    templateUrl: './my-bids.html',
    styleUrl: './my-bids.scss',
})
export class MyBids {
    // These values are *given* to this component by its parent (the dashboard).
    @Input({ required: true }) bids: MyBidDetailDTO[] | undefined;
    @Input({ required: true }) isLoading: boolean = true;

    // This just tells the table which columns to show and in what order
    public displayedColumns: string[] = ['taskTitle', 'myBid', 'bidStatus', 'taskStatus'];
}

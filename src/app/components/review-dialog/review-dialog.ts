import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReviewsApi } from '../../core/services/api/reviews-api';

@Component({
    selector: 'app-review-dialog',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
    ],
    templateUrl: './review-dialog.html',
    styleUrl: './review-dialog.scss',
})
export class ReviewDialog {
    private readonly fb = inject(FormBuilder);
    private readonly api = inject(ReviewsApi);
    private readonly dialogRef = inject(MatDialogRef<ReviewDialog>);
    private readonly snack = inject(MatSnackBar);

    // Data passed: { taskId: 123, revieweeId: 'uuid' }
    public data = inject(MAT_DIALOG_DATA);

    stars = [1, 2, 3, 4, 5];

    form = this.fb.group({
        rating: [0, [Validators.required, Validators.min(1)]],
        comment: ['', [Validators.maxLength(500)]],
    });

    setRating(rating: number) {
        this.form.patchValue({ rating });
    }

    submit() {
        if (this.form.invalid || this.form.value.rating === 0) {
            this.snack.open('Please select a star rating', 'Close', { duration: 3000 });
            return;
        }

        const payload = {
            taskId: this.data.taskId,
            revieweeId: this.data.revieweeId,
            rating: this.form.value.rating,
            comment: this.form.value.comment,
        };

        this.api.postReview(payload).subscribe({
            next: () => {
                this.snack.open('Review submitted!', 'Thanks', { duration: 3000 });
                this.dialogRef.close(true);
            },
            error: (err) => {
                console.error(err);
                const msg = err.error?.message || 'Failed to submit review';
                this.snack.open(msg, 'Close');
            },
        });
    }
}

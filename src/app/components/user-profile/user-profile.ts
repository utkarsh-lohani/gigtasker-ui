import { Component, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDTO } from '../../core/models/user.model';
import { UsersApi } from '../../core/services/api/users-api';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CountryDTO } from '../../core/models/country-region.model';
import { GenderDTO } from '../../core/models/gender.model';
import { ReferenceDataApi } from '../../core/services/api/reference-data-api';
import { ReviewDTO } from '../../core/models/review.model';
import { ReviewsApi } from '../../core/services/api/reviews-api';

@Component({
    selector: 'app-user-profile',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './user-profile.html',
    styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
    private readonly usersApi = inject(UsersApi);
    private readonly referenceDataApi = inject(ReferenceDataApi);
    private readonly fb = inject(FormBuilder);
    private readonly snack = inject(MatSnackBar);
    private readonly reviewsApi = inject(ReviewsApi);

    // State Signals
    user = signal<UserDTO | null>(null);
    countries = signal<CountryDTO[]>([]);
    genders = signal<GenderDTO[]>([]);
    rating = signal<number>(0);
    reviews = signal<ReviewDTO[]>([]);

    isLoading = signal(true);
    isUploading = signal(false);
    isEditing = signal(false);

    // Form
    editForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        dateOfBirth: [null],
        ethnicity: [''],
        genderId: [null],
        countryId: [null],
    });

    ngOnInit() {
        this.loadProfile();
    }

    loadProfile() {
        this.usersApi.getMe().subscribe({
            next: (u) => {
                this.user.set(u);
                this.loadReviews(u.keycloakId);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
        });
    }

    // --- EDIT MODES ---

    toggleEdit() {
        if (this.isEditing()) {
            // Cancel Edit
            this.isEditing.set(false);
        } else {
            // Start Edit
            this.isEditing.set(true);
            this.initializeForm();
            this.loadReferenceData(); // Fetch countries/genders if needed
        }
    }

    initializeForm() {
        const u = this.user();
        if (!u) return;

        // We need to find IDs for Country/Gender based on names if the API returns strings
        // Ideally, UserDTO should return IDs or objects.
        // Assuming for now we might need to match strings if DTO doesn't have IDs.
        // BUT, based on our backend changes, UserDTO has Strings.
        // We will need to rely on the user re-selecting or mapping them.

        this.editForm.patchValue({
            firstName: u.firstName,
            lastName: u.lastName,
            dateOfBirth: u.dateOfBirth,
            ethnicity: u.ethnicity,
            // genderId/countryId will be empty unless we map names to IDs
            // (User sets them again, or we fetch and map)
        });
    }

    loadReferenceData() {
        if (this.countries().length > 0) return; // Already loaded

        this.referenceDataApi.getCountries().subscribe((c) => {
            this.countries.set(c);
            // Auto-select current country if name matches
            const current = this.user()?.country;
            const found = c.find((x) => x.name === current?.name);
            if (found) this.editForm.patchValue({ countryId: found.id });
        });

        this.referenceDataApi.getGenders().subscribe((g) => {
            this.genders.set(g);
            const current = this.user()?.gender;
            const found = g.find((x) => x.name === current?.name);
            if (found) this.editForm.patchValue({ genderId: found.id });
        });
    }

    saveProfile() {
        if (this.editForm.invalid) return;

        const payload = this.editForm.value;
        this.isLoading.set(true);

        this.usersApi.updateProfile(payload).subscribe({
            next: (updatedUser) => {
                this.user.set(updatedUser);
                this.isEditing.set(false);
                this.isLoading.set(false);
                this.snack.open('Profile updated!', 'OK', { duration: 3000 });
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
                this.snack.open('Update failed', 'Close');
            },
        });
    }

    // --- AVATAR UPLOAD ---

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.isUploading.set(true);
        this.usersApi.uploadAvatar(this.user()?.keycloakId!, file).subscribe({
            next: (u) => {
                this.user.set(u);
                this.isUploading.set(false);
                this.snack.open('Avatar updated', 'OK', { duration: 3000 });
            },
            error: () => {
                this.isUploading.set(false);
                this.snack.open('Upload failed', 'Close');
            },
        });
    }

    getAvatarUrl(user: UserDTO): string {
        if (!user.profileImageUrl) return '/images/default-avatar.svg';
        if (user.profileImageUrl.startsWith('http')) return user.profileImageUrl;
        // Local MinIO URL
        return `http://localhost:9000/gigtasker-profile-images/${user.profileImageUrl}`;
    }

    loadReviews(uuid: string) {
        // Get Average
        this.reviewsApi.getUserRating(uuid).subscribe((r) => this.rating.set(r || 0));

        // Get List
        this.reviewsApi.getUserReviews(uuid).subscribe((r) => this.reviews.set(r));
    }
}

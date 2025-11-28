import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';
import {Router, RouterLink} from '@angular/router';
import {MatSelectModule} from '@angular/material/select';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule} from '@angular/material/icon';
import {Country, CountryDTO} from '../../core/models/country-region.model';
import {GenderDTO} from '../../core/models/gender.model';
import {ReferenceDataApi} from '../../core/services/api/reference-data-api';
import {AuthApi} from '../../core/services/api/auth-api';

@Component({
    selector: 'app-registration-component',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatOptionModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatCardModule,
        MatAutocompleteModule,
        MatIconModule,
        RouterLink,
    ],
    templateUrl: './registration-component.html',
    styleUrl: './registration-component.scss',
})
export class RegistrationComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly referenceDataApi = inject(ReferenceDataApi);
    private readonly authApi = inject(AuthApi);
    private readonly router = inject(Router);

    genders = signal<GenderDTO[]>([]);
    countries = signal<CountryDTO[]>([]);
    filteredCountries = signal<CountryDTO[]>([]);

    countryFilterCtrl = this.fb.control<string | CountryDTO>('');

    accountForm = this.fb.group({
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
    });

    personalForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        dateOfBirth: [null, Validators.required],
        genderId: [null as number | null, Validators.required], // Send ID
        ethnicity: [''],
    });

    locationForm = this.fb.group({
        country: [null as CountryDTO | null, Validators.required],
        region: [{ value: '', disabled: true }],
    });

    ngOnInit() {
        this.loadReferences();

        this.countryFilterCtrl.valueChanges.subscribe((val) => {
            if (typeof val === 'string') {
                this.filterCountries(val);
            } else if (val && typeof val === 'object') {
                this.onCountrySelected(val);
            }
        });
    }

    loadReferences() {
        this.referenceDataApi.getGenders().subscribe((g) => this.genders.set(g));
        this.referenceDataApi.getCountries().subscribe((c) => {
            this.countries.set(c);
            this.filteredCountries.set(c);
            this.autoSelectCountry(c);
        });
    }

    onCountrySelected(country: CountryDTO) {
        this.locationForm.patchValue({
            country: country,
            region: country.region ?? '',
        });
    }

    displayCountry(country: Country): string {
        return country?.name ?? '';
    }

    filterCountries(searchTerm: string) {
        const term = searchTerm.toLowerCase();
        this.filteredCountries.set(
            this.countries().filter(
                (c) => c.name.toLowerCase().includes(term) || c.isoCode.toLowerCase().includes(term)
            )
        );
    }

    autoSelectCountry(allCountries: CountryDTO[]) {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let iso = 'US';
        if (tz.includes('Kolkata') || tz.includes('Calcutta')) iso = 'IN';
        if (tz.includes('London')) iso = 'GB';

        const detected = allCountries.find((c) => c.isoCode === iso);
        if (detected) {
            this.countryFilterCtrl.setValue(detected);
            this.onCountrySelected(detected);
        }
    }

    submit() {
        if (this.accountForm.invalid || this.personalForm.invalid || this.locationForm.invalid)
            return;

        const payload = {
            ...this.accountForm.value,
            ...this.personalForm.value,
            countryId: this.locationForm.value.country?.id, // Send ID
        };

        this.authApi.register(payload).subscribe({
            next: () => {
                alert('Success! Redirecting to login...');
                this.router.navigate(['/login']);
            },
            error: (err) => alert('Error: ' + err.message),
        });
    }
}

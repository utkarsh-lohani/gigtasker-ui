import {inject, Injectable} from '@angular/core';
import {GigtaskerConstants} from '../constant';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CountryDTO} from '../../models/country-region-model';
import {GenderDTO} from '../../models/gender-model';

@Injectable({
    providedIn: 'root',
})
export class ReferenceDataApi {
    private readonly http = inject(HttpClient);

    public getCountries(): Observable<CountryDTO[]> {
        return this.http.get<CountryDTO[]>(`${GigtaskerConstants.API_URL}/api/references/countries`);
    }

    public getGenders(): Observable<GenderDTO[]> {
        return this.http.get<GenderDTO[]>(`${GigtaskerConstants.API_URL}/api/references/genders`);
    }
}

import { inject, Injectable } from '@angular/core';
import { GigtaskerConstants } from '../constant';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../../models/country-region.model';
import { Gender } from '../../models/gender.model';

@Injectable({
    providedIn: 'root',
})
export class ReferenceDataApi {
    private readonly http = inject(HttpClient);

    public getCountries(): Observable<Country[]> {
        return this.http.get<Country[]>(`${GigtaskerConstants.API_URL}/api/references/countries`);
    }

    public getGenders(): Observable<Gender[]> {
        return this.http.get<Gender[]>(`${GigtaskerConstants.API_URL}/api/references/genders`);
    }
}

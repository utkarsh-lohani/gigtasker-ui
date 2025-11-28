import {Country} from './country-region-model';
import {Gender} from './gender-model';

export interface UserDTO {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    keycloakId: string;
    dateOfBirth: string; // ISO String (YYYY-MM-DD)
    ethnicity: string;
    country: Country;
    gender: Gender;
    profileImageUrl?: string;
}

export interface UserUpdate {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string; // ISO String (YYYY-MM-DD)
    ethnicity?: string;
    genderId?: number;
    countryId?: number;
}

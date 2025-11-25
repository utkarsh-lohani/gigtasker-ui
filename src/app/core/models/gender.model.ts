export interface Gender {
    id: number;
    name: GenderType;
    description?: string;
}

export enum GenderType {
    MAN = 'MAN',
    WOMAN = 'WOMAN',
    NON_BINARY = 'NON_BINARY',
    GENDERQUEER = 'GENDERQUEER',
    GENDERFLUID = 'GENDERFLUID',
    AGENDER = 'AGENDER',
    TWO_SPIRIT = 'TWO_SPIRIT',
    TRANSGENDER = 'TRANSGENDER',
    PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
    OTHER = 'OTHER',
}

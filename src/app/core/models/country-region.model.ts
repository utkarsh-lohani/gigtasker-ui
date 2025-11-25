export interface Country {
    id: number;
    name: string; // e.g., "India"
    isoCode: string; // e.g., "IN"
    phoneCode?: string; // e.g., "+91"
    currencyCode?: string; // e.g., "INR"
    region: Region;
}

export interface Region {
    id: number;
    name: string; // e.g., "ASIA"
    subRegions?: SubRegion[];
}

export interface SubRegion {
    id: number;
    name: string; // e.g., "Southern Asia"
    region?: Region;
}

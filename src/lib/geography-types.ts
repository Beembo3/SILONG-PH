export interface Province {
  code: string;
  code9: string;
  name: string;
  slug: string;
  psgc10DigitCode: string;
  lat: number;
  lon: number;
  areaKm2: number;
  capitalCode: string;
  capitalName: string;
  localityCount: number;
}

export interface Locality {
  code: string;
  code9: string;
  name: string;
  type: "City" | "Municipality";
  provinceCode: string;
  provinceName: string;
  provinceSlug: string;
  lat: number;
  lon: number;
  areaKm2: number | null;
  isCapital: boolean;
  isCity: boolean;
  isIndependent?: boolean;
  boundaryAvailable: boolean;
  coordinateSource?: string;
  psgc10DigitCode: string;
}

export interface GeographyDataset {
  region: {
    code: string;
    name: string;
    shortName: string;
    center: { lat: number; lon: number };
  };
  provenance: {
    names: string;
    boundaries: string;
    boundaryUrl: string;
    psgcUrl: string;
    note: string;
  };
  provinces: Province[];
  localities: Locality[];
}

export interface GeoCode {
  prefix: string;      // A, B, C и т.д.
  country: string;     // TR, AU, RU и т.д.
  code: string;        // Полный код: A-TR
  checked: boolean;
  note: string;
}

export interface UrlGroup {
  id: string;
  url: string;
  geoCodes: GeoCode[];
}

export interface ParsedData {
  urlGroups: UrlGroup[];
}

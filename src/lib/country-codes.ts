import countryCodes from "country-codes-list";

export interface CountryDialCode {
  code: string;   // ISO alpha-2, e.g. "IN"
  name: string;   // "India"
  dial: string;   // "+91"
}

const raw = countryCodes.customList("countryCode", "{countryNameEn}|+{countryCallingCode}") as Record<string, string>;

export const COUNTRY_DIAL_CODES: CountryDialCode[] = Object.entries(raw)
  .map(([code, val]) => {
    const [name, dial] = val.split("|");
    return { code, name, dial };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

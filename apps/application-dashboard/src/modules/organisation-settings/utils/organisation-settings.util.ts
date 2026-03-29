// Matches standard domains and subdomains
export const isValidDomain = (value: string): boolean =>
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(value);

// Matches http/https URLs
export const isValidUrl = (value: string): boolean =>
  /^https?:\/\/([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?(\?[^\s]*)?(#[^\s]*)?$/.test(value);

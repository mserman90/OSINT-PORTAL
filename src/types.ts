export interface OSMSearchParams {
  lat: number;
  lon: number;
  radius: number;
  features: string[];
}

export interface OSMElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface GeoSpyResult {
  lat: number;
  lon: number;
  description: string;
  confidence: number;
}

export interface GeoHint {
  category: string;
  detail: string;
  regions: string;
}

export interface GeoHintsResult {
  hints: GeoHint[];
  summary: string;
}

export interface ChronoResult {
  time_of_day: string;
  season: string;
  weather: string;
  shadow_analysis: string;
}

export interface GHuntResult {
  validity: string;
  domain_intel: string;
  known_breaches: string;
  osint_advice: string;
}

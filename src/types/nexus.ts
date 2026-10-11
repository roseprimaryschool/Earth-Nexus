export type ThreatLevel = 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface ThreatIndexData {
  score: number; // 0 to 100
  level: ThreatLevel;
  trend: 'rising' | 'falling' | 'stable';
  breakdown: {
    disasters: number;
    weather: number;
    geopolitical: number;
    space: number;
    transport: number;
  };
  activeCrisisCount: number;
  lastUpdated: string;
}

export type EventCategory = 'disaster' | 'weather' | 'news' | 'space' | 'transport';

export type DisasterType = 
  | 'earthquake' 
  | 'volcano' 
  | 'wildfire' 
  | 'tsunami' 
  | 'hurricane' 
  | 'tornado' 
  | 'flood' 
  | 'landslide';

export type WeatherType = 
  | 'storm' 
  | 'rain' 
  | 'lightning' 
  | 'cloud' 
  | 'temperature' 
  | 'wind' 
  | 'air_quality';

export type SpaceType = 
  | 'iss' 
  | 'satellite' 
  | 'solar_flare' 
  | 'aurora' 
  | 'asteroid' 
  | 'rocket_launch';

export type TransportType = 
  | 'aircraft' 
  | 'vessel' 
  | 'port' 
  | 'traffic_corridor';

export interface BaseNexusEvent {
  id: string;
  category: EventCategory;
  subType: string;
  title: string;
  description: string;
  locationName: string;
  country?: string;
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;
  severity: ThreatLevel;
  verified: boolean;
  source: string;
  metrics?: Record<string, string | number>;
  tags?: string[];
  plainExplanation?: string;
  whatItMeans?: string;
  dangerLevelSimple?: 'Severe' | 'High' | 'Moderate' | 'Low';
}

export interface EarthquakeEvent extends BaseNexusEvent {
  category: 'disaster';
  subType: 'earthquake';
  magnitude: number;
  depthKm: number;
  tsunamiRisk: boolean;
}

export interface VolcanoEvent extends BaseNexusEvent {
  category: 'disaster';
  subType: 'volcano';
  alertColor: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  elevationM: number;
  plumeHeightKm?: number;
}

export interface WildfireEvent extends BaseNexusEvent {
  category: 'disaster';
  subType: 'wildfire';
  areaHectares: number;
  containmentPercent: number;
  brightnessTempK?: number;
}

export interface HurricaneEvent extends BaseNexusEvent {
  category: 'disaster';
  subType: 'hurricane';
  categoryScale: 1 | 2 | 3 | 4 | 5;
  windSpeedKmh: number;
  pressureHpa: number;
  heading: string;
}

export interface SpaceEvent extends BaseNexusEvent {
  category: 'space';
  subType: SpaceType;
  altitudeKm?: number;
  speedKmh?: number;
  trajectoryAngle?: number;
  missDistanceLd?: number; // Lunar Distances for asteroids
  diameterM?: number;
  kpIndex?: number;
}

export interface TransportEvent extends BaseNexusEvent {
  category: 'transport';
  subType: TransportType;
  callsign?: string;
  airline?: string;
  origin?: string;
  destination?: string;
  originCoords?: [number, number];
  destinationCoords?: [number, number];
  speedKnots?: number;
  altitudeFt?: number;
  vesselType?: string;
  aircraftModel?: string;
  flightProgress?: number;
  airlineColor?: number;
}

export interface WeatherEvent extends BaseNexusEvent {
  category: 'weather';
  subType: WeatherType;
  tempC?: number;
  windSpeedKmh?: number;
  rainfallMmH?: number;
  aqi?: number;
}

export interface NewsEvent extends BaseNexusEvent {
  category: 'news';
  subType: 'breaking' | 'geopolitical' | 'infrastructure' | 'health' | 'economic';
  sentiment: 'critical' | 'tense' | 'moderate' | 'neutral';
  impactRadiusKm: number;
  aiSummary?: string;
}

export type NexusEvent = 
  | EarthquakeEvent 
  | VolcanoEvent 
  | WildfireEvent 
  | HurricaneEvent 
  | SpaceEvent 
  | TransportEvent 
  | WeatherEvent 
  | NewsEvent 
  | BaseNexusEvent;

export interface CountryData {
  iso: string;
  name: string;
  capital: string;
  population: number;
  gdpBillionUsd: number;
  region: string;
  coordinates: [number, number]; // [lat, lng]
  threatLevel: ThreatLevel;
  threatScore: number;
  currentTempC: number;
  weatherCondition: string;
  airQuality: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  activeDisasters: number;
  keyRisks: string[];
  recentIncidents: string[];
  environmentalScore: number; // 0-100
  tier?: number; // 1 = Tier 1 primary country, 2 = Tier 2, 3 = Tier 3
}

export interface ActiveLayers {
  disasters: boolean;
  weather: boolean;
  news: boolean;
  space: boolean;
  transport: boolean;
  // Sub-filters
  earthquakes: boolean;
  volcanoes: boolean;
  wildfires: boolean;
  hurricanes: boolean;
  floods?: boolean;
  flights?: boolean;
  storms?: boolean;
  satellites: boolean;
  iss: boolean;
  aircraft: boolean;
  ships: boolean;
  lightning: boolean;
  clouds: boolean;
  heatmaps: boolean;
  countryBorders: boolean;
}

export type SimpleCategory =
  | 'all'
  | 'earthquake'
  | 'volcano'
  | 'wildfire'
  | 'hurricane'
  | 'flood'
  | 'flight'
  | 'storm';

export type NewsCategory =
  | 'all'
  | 'politics'
  | 'business'
  | 'tech'
  | 'world'
  | 'earthquake'
  | 'volcano'
  | 'wildfire'
  | 'hurricane'
  | 'flood'
  | 'flight'
  | 'storm';

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  newsGroup?: 'politics' | 'business' | 'tech' | 'world' | 'disasters';
  summary: string;
  plainExplanation: string;
  location: string;
  country?: string;
  coordinates: [number, number];
  timestamp: string;
  severity: 'Severe' | 'High' | 'Moderate' | 'Low' | 'Major' | 'Breaking' | 'Developing' | 'Standard';
  source: string;
  readTime: string;
  keyFacts: string[];
  relatedEventId?: string;
  url?: string;
  imageUrl?: string;
}

export type GlobeViewMode = 'standard' | 'night_recon' | 'heatmap' | 'tactical_wire';

export interface TimelinePlayback {
  isPlaying: boolean;
  currentOffsetHours: number; // 0 = live, -6, -12, -24, -48, -72, -168
  speed: number; // 1x, 2x, 5x
}

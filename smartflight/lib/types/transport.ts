/**
 * Last-Mile Logistics Data Types
 * Supports post-arrival navigation and transportation
 */

// ============= Core Types =============

export type TransportMode = "subway" | "bus" | "rail" | "taxi" | "ridehail";

export type Currency = "USD" | "KRW" | "JPY" | "EUR" | "GBP";

// ============= Airport Types =============

export interface AirportLocation {
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Terminal {
  id: string;
  name: string;
  transportAccess: {
    subway?: string[];
    bus?: string[];
    rail?: string[];
    taxi?: string[];
  };
}

export interface Airport extends AirportLocation {
  terminals: Terminal[];
  transportHub: {
    subwayStations: string[];
    busStops: string[];
    railStations: string[];
    taxiStands: string[];
  };
}

// ============= Public Transit Types =============

export interface TransitSchedule {
  weekday: TimeSlot[];
  weekend: TimeSlot[];
  holiday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;
  frequency: number; // minutes
  firstTrain?: string;
  lastTrain?: string;
}

export interface TransitRoute {
  id: string;
  name: string;
  type: "subway" | "bus" | "rail";
  operator: string;
  color?: string;
  stations: TransitStation[];
  schedule: TransitSchedule;
  fare: FareInfo;
  travelTime: number; // minutes to city center
  accessibility: AccessibilityInfo;
}

export interface TransitStation {
  id: string;
  name: string;
  nameLocal?: string;
  order: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  connections: string[]; // other line IDs
}

export interface FareInfo {
  currency: Currency;
  adult: number;
  child?: number;
  senior?: number;
  discounts: Discount[];
  paymentMethods: PaymentMethod[];
}

export interface Discount {
  type: "pass" | "card" | "group" | "roundtrip";
  name: string;
  description: string;
  savings: number | string;
}

export interface PaymentMethod {
  type: "cash" | "card" | "mobile" | "transit_card";
  name: string;
  supported: boolean;
}

export interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  elevator: boolean;
  escalator: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
}

// ============= Ride-Hailing Types =============

export interface RideHailingProvider {
  id: string;
  name: string;
  logo: string;
  region: string[];
  services: RideService[];
  appLinks: AppLinks;
  affiliateTracking?: AffiliateTracking;
}

export interface RideService {
  id: string;
  name: string;
  type: "economy" | "comfort" | "premium" | "xl" | "shared";
  description: string;
  capacity: number;
  estimatedPrice: PriceEstimate;
  estimatedTime: number; // minutes
  features: string[];
  availability: Availability;
}

export interface PriceEstimate {
  currency: Currency;
  min: number;
  max: number;
  base: number;
  perKm?: number;
  perMinute?: number;
  surcharges?: Surcharge[];
}

export interface Surcharge {
  type: "airport" | "peak" | "night" | "toll";
  name: string;
  amount: number | string;
}

export interface Availability {
  available24h: boolean;
  peakHours?: string[];
  restrictions?: string[];
}

export interface AppLinks {
  ios: string;
  android: string;
  web?: string;
  deepLink?: string;
}

export interface AffiliateTracking {
  enabled: boolean;
  partnerId?: string;
  trackingUrl?: string;
  commission?: {
    type: "percentage" | "fixed";
    value: number;
  };
}

// ============= Taxi Types =============

export interface OfficialTaxiInfo {
  airportCode: string;
  services: TaxiService[];
  stands: TaxiStand[];
  scamPrevention: ScamPreventionTips;
  officialRates: OfficialRate[];
}

export interface TaxiService {
  id: string;
  name: string;
  type: "regular" | "deluxe" | "large" | "international";
  description: string;
  color?: string;
  phoneNumber?: string;
  bookingUrl?: string;
  fixedRates: FixedRate[];
  features: string[];
}

export interface FixedRate {
  destination: string;
  destinationType: "city_center" | "district" | "landmark" | "station";
  price: number;
  currency: Currency;
  duration: number; // minutes
  distance: number; // km
  tollsIncluded: boolean;
}

export interface TaxiStand {
  id: string;
  terminal: string;
  location: string;
  floor: string;
  gate?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  queueTime?: number; // average minutes
  operatingHours: string;
}

export interface OfficialRate {
  destination: string;
  baseRate: number;
  currency: Currency;
  additionalCharges?: string[];
  notes?: string[];
}

export interface ScamPreventionTips {
  warnings: string[];
  redFlags: string[];
  officialIdentifiers: string[];
  reportingContacts: Contact[];
  safetyTips: string[];
}

export interface Contact {
  type: "phone" | "email" | "website" | "app";
  label: string;
  value: string;
}

// ============= Combined Transport Options =============

export interface TransportOption {
  id: string;
  mode: TransportMode;
  provider: string;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: Currency;
    display: string;
  };
  duration: number; // minutes
  distance?: number; // km
  comfort: 1 | 2 | 3 | 4 | 5;
  convenience: 1 | 2 | 3 | 4 | 5;
  reliability: 1 | 2 | 3 | 4 | 5;
  pros: string[];
  cons: string[];
  bookingUrl?: string;
  affiliateLink?: string;
  realTimeAvailable: boolean;
}

// ============= User Preferences =============

export interface TransportPreferences {
  preferredModes: TransportMode[];
  maxBudget?: number;
  maxWalkingDistance?: number; // meters
  requiresAccessibility: boolean;
  luggageCount: number;
  passengerCount: number;
  preferredLanguage: string;
}

// ============= Search & Filter =============

export interface TransportSearchParams {
  airportCode: string;
  destination?: string;
  departureTime?: Date;
  preferences?: TransportPreferences;
  sortBy?: "price" | "duration" | "comfort" | "convenience";
}

export interface TransportSearchResult {
  airport: Airport;
  options: TransportOption[];
  publicTransit: TransitRoute[];
  ridehailing: RideHailingProvider[];
  officialTaxis: OfficialTaxiInfo;
  recommendations: Recommendation[];
}

export interface Recommendation {
  optionId: string;
  reason: string;
  score: number;
  badges: ("cheapest" | "fastest" | "most_convenient" | "recommended")[];
}

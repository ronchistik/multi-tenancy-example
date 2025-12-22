/**
 * Hardcoded locations with coordinates for hotel search
 * (Duffel Stays requires geographic coordinates)
 */

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export const LOCATIONS: Record<string, Location> = {
  'nyc': {
    id: 'nyc',
    name: 'New York City, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    radiusKm: 10,
  },
  'london': {
    id: 'london',
    name: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
    radiusKm: 10,
  },
  'tokyo': {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    radiusKm: 15,
  },
  'paris': {
    id: 'paris',
    name: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
    radiusKm: 10,
  },
  'dubai': {
    id: 'dubai',
    name: 'Dubai, UAE',
    latitude: 25.2048,
    longitude: 55.2708,
    radiusKm: 15,
  },
};

export function getLocation(id: string): Location | undefined {
  return LOCATIONS[id];
}

export function getAllLocations(): Location[] {
  return Object.values(LOCATIONS);
}


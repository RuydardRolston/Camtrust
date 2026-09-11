/**
 * Location utilities for CamTrust
 * Reverse geocoding using OpenStreetMap Nominatim (free, no API key required)
 */

export interface LocationInfo {
  displayName: string;
  city?: string;
  country?: string;
  road?: string;
  suburb?: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const REQUEST_DELAY = 1000;
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getLocationName = async (
  lat: number,
  lng: number
): Promise<LocationInfo> => {
  // Validate coordinates
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    isNaN(lat) ||
    isNaN(lng) ||
    Math.abs(lat) > 90 ||
    Math.abs(lng) > 180
  ) {
    return {
      displayName: `${lat?.toFixed(4) || '0'}, ${lng?.toFixed(4) || '0'}`,
    };
  }

  const fallback: LocationInfo = {
    displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CamTrust/1.0 (construction-monitoring-app)',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'application/json',
            Referer: 'https://camtrust.example.com/',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - wait and retry
          await sleep(REQUEST_DELAY * (attempt + 1));
          continue;
        }
        throw new Error(`Geocoding request failed with status ${response.status}`);
      }

      const data = await response.json();
      const addr = data.address || {};

      return {
        displayName: data.display_name || fallback.displayName,
        city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
        country: addr.country || '',
        road: addr.road || addr.street || addr.footway || '',
        suburb: addr.suburb || addr.neighbourhood || addr.quarter || '',
      };
    } catch (error) {
      console.error(`Reverse geocoding error (attempt ${attempt + 1}):`, error);
      if (attempt < MAX_RETRIES) {
        await sleep(REQUEST_DELAY);
      }
    }
  }

  return fallback;
};

export const formatLocationForWatermark = (location: LocationInfo): string => {
  const parts = [];
  if (location.road) parts.push(location.road);
  if (location.suburb) parts.push(location.suburb);
  if (location.city) parts.push(location.city);
  if (location.country) parts.push(location.country);

  if (parts.length > 0) {
    return parts.join(', ');
  }
  return location.displayName.split(',').slice(0, 3).join(',');
};

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

export const getLocationName = async (
  lat: number,
  lng: number
): Promise<LocationInfo> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CamTrust/1.0 (construction-monitoring-app)',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    const addr = data.address || {};

    return {
      displayName: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: addr.city || addr.town || addr.village || addr.municipality || addr.county || '',
      country: addr.country || '',
      road: addr.road || addr.street || addr.footway || '',
      suburb: addr.suburb || addr.neighbourhood || addr.quarter || '',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    };
  }
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

/**
 * CamTrust - Location Name Hook
 * Reverse geocodes GPS coordinates to human-readable location names.
 * Uses OpenStreetMap Nominatim with simple in-memory caching.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLocationName, LocationInfo } from '../utils/locationService';

const locationCache = new Map<string, LocationInfo>();

export const useLocationName = (
  lat: number | null | undefined,
  lng: number | null | undefined
): { locationName: string; loading: boolean } => {
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const cacheKey = lat && lng ? `${lat.toFixed(4)},${lng.toFixed(4)}` : '';
  const mountedRef = useRef(true);

  const resolveLocation = useCallback(async () => {
    if (lat === null || lat === undefined || lng === null || lng === undefined) {
      setLocationName('GPS Verified on Site');
      return;
    }

    const cached = locationCache.get(cacheKey);
    if (cached) {
      setLocationName(
        cached.displayName ||
          cached.city ||
          cached.country ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      );
      return;
    }

    setLoading(true);
    try {
      const info = await getLocationName(lat, lng);
      locationCache.set(cacheKey, info);
      if (!mountedRef.current) return;
      setLocationName(
        info.displayName ||
          info.city ||
          info.country ||
          `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      );
    } catch {
      if (!mountedRef.current) return;
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [lat, lng, cacheKey]);

  useEffect(() => {
    mountedRef.current = true;
    resolveLocation();
    return () => {
      mountedRef.current = false;
    };
  }, [resolveLocation]);

  return { locationName, loading };
};

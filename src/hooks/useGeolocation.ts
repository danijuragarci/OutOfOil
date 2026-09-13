import { useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation, GPSStatus } from '../types';
import {
  getLastKnownLocation,
  saveLastKnownLocation,
  DEFAULT_FALLBACK_LOCATION,
  getCurrentBrowserPosition,
  reverseGeocode,
} from '../services/locationService';

interface UseGeolocationReturn {
  location: UserLocation;
  status: GPSStatus;
  errorMessage: string | null;
  requestCurrentLocation: (opts?: { userInitiated?: boolean }) => Promise<UserLocation | null>;
  setManualLocation: (lat: number, lng: number, city: string, address?: string) => void;
  isPermissionDenied: boolean;
  isLastKnown: boolean;
  formatLocationLabel: () => string;
}

export function useGeolocation(onToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void): UseGeolocationReturn {
  // 1. Initialize location immediately with the last known location from localStorage
  const [location, setLocation] = useState<UserLocation>(() => {
    const saved = getLastKnownLocation();
    if (saved) return saved;
    return DEFAULT_FALLBACK_LOCATION;
  });

  const [status, setStatus] = useState<GPSStatus>(() => {
    const saved = getLastKnownLocation();
    return saved ? 'last_known' : 'idle';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isRequestingRef = useRef(false);

  // 2. Function to request the real browser location
  const requestCurrentLocation = useCallback(
    async (opts?: { userInitiated?: boolean }): Promise<UserLocation | null> => {
      if (isRequestingRef.current) return null;
      isRequestingRef.current = true;
      setStatus('loading');
      setErrorMessage(null);

      try {
        // Request GPS coordinates
        const browserPos = await getCurrentBrowserPosition();

        // Perform reverse geocoding to obtain human-readable address & city
        const geoInfo = await reverseGeocode(browserPos.lat, browserPos.lng);

        const newLoc: UserLocation = {
          lat: browserPos.lat,
          lng: browserPos.lng,
          accuracy: browserPos.accuracy,
          address: geoInfo.address,
          city: geoInfo.city,
          province: geoInfo.province,
          postcode: geoInfo.postcode,
          timestamp: Date.now(),
          source: 'gps',
        };

        // Update state and persist to localStorage
        setLocation(newLoc);
        saveLastKnownLocation(newLoc);
        setStatus('success');
        setErrorMessage(null);

        if (opts?.userInitiated && onToast) {
          onToast(`Ubicación GPS detectada: ${newLoc.address || newLoc.city}`, 'success');
        }

        isRequestingRef.current = false;
        return newLoc;
      } catch (err: any) {
        console.warn('Geolocation request failed:', err);
        isRequestingRef.current = false;

        let errMsg = 'No se pudo obtener la señal GPS.';
        let newStatus: GPSStatus = 'error';

        if (err?.code === 1) {
          // PERMISSION_DENIED
          errMsg = 'Permiso de ubicación no concedido en el navegador.';
          newStatus = 'denied';
          if (opts?.userInitiated && onToast) {
            onToast('Permiso de GPS no concedido. Por favor, actívalo en los ajustes del navegador.', 'warning');
          }
        } else if (err?.code === 2) {
          // POSITION_UNAVAILABLE
          errMsg = 'Señal de ubicación no disponible en este momento.';
          newStatus = 'error';
          if (opts?.userInitiated && onToast) {
            onToast('Señal GPS no disponible. Mostrando última ubicación conocida.', 'info');
          }
        } else if (err?.code === 3) {
          // TIMEOUT
          errMsg = 'Tiempo de espera agotado al conectar con el GPS.';
          newStatus = 'error';
          if (opts?.userInitiated && onToast) {
            onToast('Tiempo agotado de GPS. Mostrando última ubicación conocida.', 'info');
          }
        }

        setErrorMessage(errMsg);
        setStatus(newStatus);

        // Keep last known location if we have one
        const lastKnown = getLastKnownLocation();
        if (lastKnown) {
          setLocation(lastKnown);
        }

        return null;
      }
    },
    [onToast]
  );

  // 3. Allow manual location override
  const setManualLocation = useCallback(
    (lat: number, lng: number, city: string, address?: string) => {
      const newLoc: UserLocation = {
        lat,
        lng,
        city,
        address: address || city,
        timestamp: Date.now(),
        source: 'manual',
      };
      setLocation(newLoc);
      saveLastKnownLocation(newLoc);
      setStatus('success');
      setErrorMessage(null);
      if (onToast) {
        onToast(`Ubicación establecida: ${city}`, 'info');
      }
    },
    [onToast]
  );

  // 4. Auto-request location on initial mount once
  useEffect(() => {
    // Only attempt silent request if navigator supports geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      requestCurrentLocation({ userInitiated: false });
    }
  }, [requestCurrentLocation]);

  const isPermissionDenied = status === 'denied';
  const isLastKnown = location.source === 'last_known' || status === 'last_known';

  const formatLocationLabel = useCallback(() => {
    if (location.address && location.city && !location.address.includes(location.city)) {
      return `${location.address}, ${location.city}`;
    }
    return location.address || location.city || 'Ubicación actual';
  }, [location]);

  return {
    location,
    status,
    errorMessage,
    requestCurrentLocation,
    setManualLocation,
    isPermissionDenied,
    isLastKnown,
    formatLocationLabel,
  };
}

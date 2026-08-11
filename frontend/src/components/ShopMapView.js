// frontend/src/components/ShopMapView.js
import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../contexts/ThemeContext';
import GOOGLE_MAP_DARK_STYLE from '../utils/googleMapDarkStyle';

const MAP_CONTAINER_STYLE = { width: '100%', height: '200px', borderRadius: '12px' };
const MAP_OPTIONS = { disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative' };

function getDirections(latitude, longitude) {
  const destination = `${latitude},${longitude}`;
  const open = (originParam = '') => {
    window.open(
      `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (!navigator.geolocation) {
    open();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => open(`&origin=${pos.coords.latitude},${pos.coords.longitude}`),
    () => open(), // denied, unavailable, or timed out — fall back to destination-only
    { timeout: 5000 }
  );
}

/**
 * ShopMapView — read-only shop location display: address text, map + marker, Get Directions button.
 * @param {string} shopName
 * @param {string} fullAddress
 * @param {{address: string, latitude: number, longitude: number}|null|undefined} location
 */
function ShopMapView({ shopName, fullAddress, location }) {
  const hasLocation = !!location && typeof location.latitude === 'number' && typeof location.longitude === 'number';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    skip: !hasLocation,
  });
  const { resolvedTheme } = useTheme();

  if (!hasLocation) {
    return (
      <p className="text-xs text-outline italic">Exact location not set by this shop yet.</p>
    );
  }

  const center = { lat: location.latitude, lng: location.longitude };

  return (
    <div className="space-y-3">
      {loadError && (
        <p className="text-sm text-error">Could not load the map.</p>
      )}
      {!loadError && !isLoaded && (
        <div className="h-[200px] rounded-xl bg-surface-container-high animate-pulse" />
      )}
      {!loadError && isLoaded && (
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={16}
          options={{ ...MAP_OPTIONS, styles: resolvedTheme === 'dark' ? GOOGLE_MAP_DARK_STYLE : [] }}
        >
          <Marker position={center} title={shopName} />
        </GoogleMap>
      )}
      <button
        type="button"
        onClick={() => getDirections(location.latitude, location.longitude)}
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <span className="material-symbols-outlined text-lg">directions</span>
        Get Directions
      </button>
    </div>
  );
}

export default ShopMapView;

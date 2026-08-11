// frontend/src/components/LocationPicker.js
import React, { useState, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useTheme } from '../contexts/ThemeContext';
import GOOGLE_MAP_DARK_STYLE from '../utils/googleMapDarkStyle';
import Button from './ui/Button';

const GOOGLE_MAPS_LIBRARIES = ['places'];
const MAP_CONTAINER_STYLE = { width: '100%', height: '280px', borderRadius: '12px' };
const INDIA_FALLBACK_CENTER = { lat: 22.9734, lng: 78.6569 };

/**
 * LocationPicker
 * @param {{address: string, latitude: number, longitude: number}|null} value - current saved location, or null/undefined if unset
 * @param {function} onChange - callback({address, latitude, longitude}) fired whenever the user picks/confirms a new location
 * @param {string} [fallbackAddressText] - address text to prefill the search box with when value is unset
 */
function LocationPicker({ value, onChange, fallbackAddressText = '' }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  const { resolvedTheme } = useTheme();

  const [marker, setMarker] = useState(value ? { lat: value.latitude, lng: value.longitude } : null);
  const [addressText, setAddressText] = useState(value?.address || fallbackAddressText);
  const [zoom, setZoom] = useState(marker ? 16 : 5);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const geocoderRef = useRef(null);

  const getGeocoder = useCallback(() => {
    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  }, []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    getGeocoder();
  }, [getGeocoder]);

  const applyLocation = useCallback((lat, lng, address) => {
    setMarker({ lat, lng });
    setAddressText(address);
    setZoom(16);
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
    onChange({ address, latitude: lat, longitude: lng });
  }, [onChange]);

  const reverseGeocode = useCallback((lat, lng) => {
    const geocoder = getGeocoder();
    if (!geocoder) return;
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const formatted = status === 'OK' && results[0] ? results[0].formatted_address : addressText;
      applyLocation(lat, lng, formatted);
    });
  }, [addressText, applyLocation, getGeocoder]);

  // Detect the shopkeeper's current location — deliberately triggered only from a
  // real click (the button below), never automatically on mount. Browsers commonly
  // suppress the permission prompt entirely for a geolocation request that isn't
  // tied to a direct user gesture, which silently defeats an auto-fire-on-load
  // attempt (it looks like "nothing happens" — no prompt, no error, no location).
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Your browser does not support location detection.');
      return;
    }
    setLocateError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. You can allow it in your browser settings, or search/click on the map instead.'
            : 'Could not detect your location. Please search or click on the map instead.'
        );
      },
      { timeout: 8000 }
    );
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place || !place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    applyLocation(lat, lng, place.formatted_address || addressText);
  };

  const handleMarkerDragEnd = (e) => {
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  };

  const handleMapClick = (e) => {
    reverseGeocode(e.latLng.lat(), e.latLng.lng());
  };

  if (loadError) {
    return <p className="text-sm text-error">Could not load Google Maps. Check your API key.</p>;
  }

  if (!isLoaded) {
    return <div className="h-[280px] rounded-xl bg-surface-container-high animate-pulse" />;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Autocomplete onLoad={(a) => (autocompleteRef.current = a)} onPlaceChanged={handlePlaceChanged} className="flex-1">
          <input
            type="text"
            aria-label="Search for your shop's address"
            placeholder="Search for your shop's address…"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            className="input-stitch"
          />
        </Autocomplete>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          iconLeft="my_location"
          loading={locating}
          onClick={handleUseMyLocation}
          className="sm:w-auto whitespace-nowrap"
        >
          Use my location
        </Button>
      </div>
      {locateError && (
        <p role="alert" className="text-xs text-error font-medium">{locateError}</p>
      )}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={marker || INDIA_FALLBACK_CENTER}
        zoom={zoom}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={{ styles: resolvedTheme === 'dark' ? GOOGLE_MAP_DARK_STYLE : [] }}
      >
        {marker && <Marker position={marker} draggable onDragEnd={handleMarkerDragEnd} />}
      </GoogleMap>
      <p className="text-xs text-on-surface-variant">
        {locating
          ? 'Detecting your current location…'
          : marker
          ? 'Drag the marker or click elsewhere on the map to fine-tune the exact location.'
          : 'Search an address above, or click anywhere on the map to drop a pin.'}
      </p>
    </div>
  );
}

export default LocationPicker;

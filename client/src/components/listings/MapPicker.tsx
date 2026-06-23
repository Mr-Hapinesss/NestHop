import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number, address: string) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ lat = -1.2921, lng = 36.8219, onChange }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries: ['places'],
  });

  const [marker, setMarker] = useState({ lat, lng });
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
      );
      const data = await res.json();
      const address = data.results?.[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      return address;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setMarker({ lat: newLat, lng: newLng });
    const address = await reverseGeocode(newLat, newLng);
    onChange(newLat, newLng, address);
  }, [onChange, reverseGeocode]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchInput)}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setMarker({ lat, lng });
        onChange(lat, lng, data.results[0].formatted_address);
      }
    } catch {
      console.error('Geocode failed');
    } finally {
      setSearching(false);
    }
  };

  if (!isLoaded) return (
    <div style={{ height: 300, background: 'var(--bg-secondary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: "'Neuton', serif", color: 'var(--text-muted)' }}>Loading map...</div>
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search for an address..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1.5px solid var(--border-color)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)',
            fontFamily: "'Neuton', serif", fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            padding: '10px 16px', borderRadius: 10,
            background: '#4F252E', color: '#FFF7C5',
            border: 'none', cursor: 'pointer',
          }}
        >
          <Search size={16} />
        </button>
      </div>

      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: 300 }}
          center={marker}
          zoom={15}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            styles: [
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
            ],
          }}
        >
          <Marker
            position={marker}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#4F252E',
              fillOpacity: 1,
              strokeColor: '#FFF7C5',
              strokeWeight: 3,
            }}
          />
        </GoogleMap>
      </div>
      <p style={{ marginTop: 8, fontFamily: "'Neuton', serif", fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={12} /> Click on the map to pin the exact location of the property
      </p>
    </div>
  );
};

export default MapPicker;
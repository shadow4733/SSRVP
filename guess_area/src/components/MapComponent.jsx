import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, ACTIVE_TILE_STYLE } from '../utils/mapConfig';

// Настройка иконок маркеров
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Компонент для обработки кликов по карте
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Компонент для установки жестких границ
function BoundsEnforcer() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(
      MAP_CONFIG.bounds.southwest,
      MAP_CONFIG.bounds.northeast
    );

    map.setMaxBounds(bounds);
    map.on('drag', function() {
      map.panInsideBounds(bounds, { animate: false });
    });
  }, [map]);

  return null;
}

const MapComponent = ({ currentCity, guessedCoords, onMapClick, showLine, actualCityCoords }) => {
  const tileStyle = MAP_CONFIG.tileStyles[ACTIVE_TILE_STYLE];
  const bounds = [MAP_CONFIG.bounds.southwest, MAP_CONFIG.bounds.northeast];

  const linePositions = (actualCityCoords && guessedCoords && showLine)
    ? [actualCityCoords, guessedCoords]
    : [];

  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      style={{
        width: '1400px',
        height: '700px',
        border: '2px solid #333',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        backgroundColor: '#f0f0f0'
      }}
      attributionControl={false}
      maxBounds={bounds}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
    >
      <TileLayer
        url={tileStyle.url}
        maxZoom={tileStyle.maxZoom}
        bounds={bounds}
      />

      <BoundsEnforcer />

      {actualCityCoords && showLine && (
        <Marker position={actualCityCoords}>
          <Popup>✅ Правильный ответ: {currentCity?.name}</Popup>
        </Marker>
      )}

      {guessedCoords && (
        <Marker position={guessedCoords}>
          <Popup>Ваша догадка</Popup>
        </Marker>
      )}

      {linePositions.length === 2 && (
        <Polyline
          positions={linePositions}
          color="red"
          dashArray="5, 10"
          weight={3}
        />
      )}

      <ClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
};

export default MapComponent;
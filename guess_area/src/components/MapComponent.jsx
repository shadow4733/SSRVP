import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const MapComponent = ({ currentCity, guessedCoords, onMapClick, showLine }) => {
  // Линия рисуется только если showLine = true и есть обе точки
  const linePositions = (currentCity && guessedCoords && showLine) 
    ? [currentCity.coords, guessedCoords] 
    : [];

  return (
    <MapContainer
      center={[55.75, 37.62]}
      zoom={5}
      style={{ width: '1400px', height: '700px', border: '2px solid #333', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
      attributionControl={false}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
      worldCopyJump={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        maxZoom={19}
        subdomains="abcd"
      />
      
      {/* Маркер загаданного города */}
      {currentCity && showLine && (
  	<Marker position={currentCity.coords}>
    	  <Popup>{currentCity.name}</Popup>
  	</Marker>
      )}

      {/* Маркер точки, куда кликнул игрок */}
      {guessedCoords && (
        <Marker position={guessedCoords}>
          <Popup>Ваша точка</Popup>
        </Marker>
      )}

      {/* Пунктирная линия, если нужно показать результат */}
      {linePositions.length === 2 && (
        <Polyline positions={linePositions} color="red" dashArray="5, 10" weight={2} />
      )}

      <ClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
};

export default MapComponent;
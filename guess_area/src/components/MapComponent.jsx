import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, ACTIVE_TILE_STYLE } from '../utils/mapConfig';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * Обработчик кликов по карте Leaflet.
 * @param {{onMapClick: (coords: number[]) => void}} props Пропсы обработчика.
 * @returns {null}
 */
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Ограничивает перемещение карты в заданных границах.
 * @returns {null}
 */
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

const OPPONENT_COLORS = ['#ff6b6b', '#ff9f43', '#f368e0', '#10ac84', '#48dbfb', '#54a0ff'];

/**
 * Компонент карты игры с маркерами, линиями и кликами соперников.
 * @param {{
 * currentCity: Object|null,
 * guessedCoords: number[]|null,
 * onMapClick: (coords: number[]) => void,
 * showLine: boolean,
 * actualCityCoords: number[]|null,
 * opponentGuesses?: Object[]
 * }} props Пропсы карты.
 * @returns {JSX.Element}
 */
const MapComponent = ({
  currentCity,
  guessedCoords,
  onMapClick,
  showLine,
  actualCityCoords,
  opponentGuesses = [],
}) => {
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

      {showLine && opponentGuesses.map((guess, index) => {
        if (guess.guessed_lat === null || guess.guessed_lng === null) {
          return null;
        }
        const color = OPPONENT_COLORS[index % OPPONENT_COLORS.length];
        return (
          <CircleMarker
            key={`${guess.user_id}-${index}`}
            center={[guess.guessed_lat, guess.guessed_lng]}
            radius={9}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              🎯 {guess.username}
              <br />
              Очки за раунд: {guess.points_earned}
            </Popup>
          </CircleMarker>
        );
      })}

      <ClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
};

export default MapComponent;

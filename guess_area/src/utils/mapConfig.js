
export const MAP_CONFIG = {
  bounds: {
    southwest: [41.5, 27],
    northeast: [77, 170]
  },
  
  center: [62, 95],
  zoom: 4,
  minZoom: 4,
  maxZoom: 10,
  
  // Стиль карты
  tileStyles: {
    nolabels: {
      url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      maxZoom: 19,
      name: 'Без названий (светлая)'
    }
  }
};

export const ACTIVE_TILE_STYLE = 'nolabels';

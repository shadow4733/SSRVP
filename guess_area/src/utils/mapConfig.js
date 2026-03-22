export const MAP_CONFIG = {
  bounds: {
    southwest: [-60, -180],   // Юго-запад: без Антарктиды
    northeast: [90, 180]       // Северо-восток: весь мир
  },
  
  center: [62, 95],
  zoom: 3,
  minZoom: 3,
  maxZoom: 10,
  

  tileStyles: {
    nolabels: {
      url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      maxZoom: 19,
      name: 'Без названий (светлая)'
    }
  }
};

export const ACTIVE_TILE_STYLE = 'nolabels';
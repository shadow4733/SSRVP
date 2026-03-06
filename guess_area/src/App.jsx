import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';

// Города
const cities = [
  { name: 'Москва', coords: [55.7558, 37.6176] },
  { name: 'Санкт-Петербург', coords: [59.9388, 30.3143] },
  { name: 'Новосибирск', coords: [55.0287, 82.9069] },
  { name: 'Екатеринбург', coords: [56.8380, 60.5973] },
  { name: 'Казань', coords: [55.7958, 49.1066] },
  { name: 'Нижний Новгород', coords: [56.3239, 44.0023] },
  { name: 'Челябинск', coords: [55.1598, 61.4025] },
  { name: 'Самара', coords: [53.1955, 50.1018] },
  { name: 'Омск', coords: [54.9893, 73.3682] },
  { name: 'Ростов-на-Дону', coords: [47.2272, 39.7450] },
  { name: 'Уфа', coords: [54.7348, 55.9578] },
  { name: 'Красноярск', coords: [56.0087, 92.8705] },
  { name: 'Пермь', coords: [58.0048, 56.2377] },
  { name: 'Воронеж', coords: [51.6615, 39.2003] },
  { name: 'Волгоград', coords: [48.7071, 44.5169] },
  { name: 'Краснодар', coords: [45.0239, 38.9702] },
  { name: 'Саратов', coords: [51.5315, 46.0358] },
  { name: 'Тюмень', coords: [57.1530, 65.5343] },
  { name: 'Тольятти', coords: [53.5113, 49.4181] },
  { name: 'Ижевск', coords: [56.8528, 53.2115] },
  { name: 'Барнаул', coords: [53.3561, 83.7496] },
  { name: 'Ульяновск', coords: [54.3170, 48.4022] },
  { name: 'Иркутск', coords: [52.2864, 104.2807] },
  { name: 'Хабаровск', coords: [48.4726, 135.0577] },
  { name: 'Ярославль', coords: [57.6266, 39.8938] },
  { name: 'Владивосток', coords: [43.1340, 131.9284] },
  { name: 'Махачкала', coords: [42.9849, 47.5046] },
  { name: 'Томск', coords: [56.4951, 84.9721] },
  { name: 'Оренбург', coords: [51.7681, 55.0974] },
  { name: 'Кемерово', coords: [55.3596, 86.0878] },
  { name: 'Новокузнецк', coords: [53.7865, 87.1552] },
  { name: 'Рязань', coords: [54.6199, 39.7450] },
  { name: 'Астрахань', coords: [46.3479, 48.0336] },
  { name: 'Набережные Челны', coords: [55.7436, 52.3958] },
  { name: 'Пенза', coords: [53.1945, 45.0195] },
  { name: 'Липецк', coords: [52.6102, 39.5947] },
  { name: 'Киров', coords: [58.6035, 49.6679] },
  { name: 'Чебоксары', coords: [56.1439, 47.2489] },
  { name: 'Тула', coords: [54.1930, 37.6178] },
  { name: 'Калининград', coords: [54.7102, 20.5100] },
  { name: 'Балашиха', coords: [55.8100, 37.9600] },
  { name: 'Курск', coords: [51.7304, 36.1926] },
  { name: 'Ставрополь', coords: [45.0445, 41.9691] },
  { name: 'Улан-Удэ', coords: [51.8335, 107.5841] },
  { name: 'Тверь', coords: [56.8596, 35.9119] },
  { name: 'Магнитогорск', coords: [53.4117, 58.9844] },
  { name: 'Сочи', coords: [43.5815, 39.7229] },
  { name: 'Белгород', coords: [50.5975, 36.5888] },
  { name: 'Нижний Тагил', coords: [57.9101, 59.9813] },
  { name: 'Архангельск', coords: [64.5393, 40.5187] },
  { name: 'Владимир', coords: [56.1290, 40.4070] },
  { name: 'Смоленск', coords: [54.7818, 32.0401] },
  { name: 'Чита', coords: [52.0333, 113.5000] },
  { name: 'Калуга', coords: [54.5070, 36.2523] },
  { name: 'Симферополь', coords: [44.9521, 34.1024] },
  { name: 'Вологда', coords: [59.2205, 39.8916] },
  { name: 'Саранск', coords: [54.1874, 45.1839] },
  { name: 'Владикавказ', coords: [43.0241, 44.6905] },
  { name: 'Якутск', coords: [62.0278, 129.7042] },
  { name: 'Грозный', coords: [43.3180, 45.6982] },
  { name: 'Мурманск', coords: [68.9696, 33.0745] },
  { name: 'Кострома', coords: [57.7677, 40.9264] },
  { name: 'Комсомольск-на-Амуре', coords: [50.5499, 137.0079] },
  { name: 'Петрозаводск', coords: [61.7898, 34.3596] },
  { name: 'Таганрог', coords: [47.2333, 38.9000] },
  { name: 'Йошкар-Ола', coords: [56.6344, 47.8999] },
  { name: 'Братск', coords: [56.1514, 101.6342] },
  { name: 'Новороссийск', coords: [44.7235, 37.7687] },
  { name: 'Дзержинск', coords: [56.2400, 43.4600] },
  { name: 'Орёл', coords: [52.9703, 36.0635] },
  { name: 'Химки', coords: [55.8970, 37.4300] },
  { name: 'Подольск', coords: [55.4300, 37.5400] },
  { name: 'Псков', coords: [57.8194, 28.3318] },
  { name: 'Мытищи', coords: [55.9100, 37.7500] },
  { name: 'Рыбинск', coords: [58.1385, 38.5736] },
  { name: 'Бийск', coords: [52.5414, 85.2197] },
  { name: 'Люберцы', coords: [55.6800, 37.8900] },
  { name: 'Ковров', coords: [56.3600, 41.3200] },
  { name: 'Коломна', coords: [55.0800, 38.7800] },
  { name: 'Электросталь', coords: [55.7900, 38.4400] },
  { name: 'Королёв', coords: [55.9200, 37.8200] },
  { name: 'Серпухов', coords: [54.9200, 37.4100] },
  { name: 'Одинцово', coords: [55.6800, 37.2800] },
  { name: 'Нефтекамск', coords: [56.0883, 54.2483] },
  { name: 'Жуковский', coords: [55.6000, 38.1200] },
  { name: 'Ноябрьск', coords: [63.2000, 75.4500] },
  { name: 'Кызыл', coords: [51.7147, 94.4534] },
  { name: 'Элиста', coords: [46.3078, 44.2558] },
  { name: 'Анадырь', coords: [64.7300, 177.5100] },
  { name: 'Биробиджан', coords: [48.7900, 132.9200] },
  { name: 'Горно-Алтайск', coords: [51.9600, 85.9200] },
  { name: 'Черкесск', coords: [44.2220, 42.0578] },
  { name: 'Нальчик', coords: [43.4981, 43.6179] },
  { name: 'Майкоп', coords: [44.6098, 40.1008] },
  { name: 'Кызыл', coords: [51.7147, 94.4534] },
  { name: 'Абакан', coords: [53.7210, 91.4424] },
  { name: 'Петропавловск-Камчатский', coords: [53.0167, 158.6500] },
  { name: 'Благовещенск', coords: [50.2907, 127.5272] },
  { name: 'Великий Новгород', coords: [58.5215, 31.2755] }
];
function App() {
  const [score, setScore] = useState(0);
  const [currentCity, setCurrentCity] = useState(null);
  const [guessedCoords, setGuessedCoords] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  // Выбор первого города при загрузке
  useEffect(() => {
    pickRandomCity();
  }, []);

  const pickRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * cities.length);
    setCurrentCity(cities[randomIndex]);
    setGuessedCoords(null);
    setLastResult(null);
  };

  const handleMapClick = (coords) => {
    setGuessedCoords(coords);
    setLastResult(null); // новый клик сбрасывает предыдущий результат
  };

  const handleSubmit = () => {
    if (!currentCity || !guessedCoords) return;

    const cityLatLng = L.latLng(currentCity.coords[0], currentCity.coords[1]);
    const guessedLatLng = L.latLng(guessedCoords[0], guessedCoords[1]);
    const distance = cityLatLng.distanceTo(guessedLatLng); // метры

    // Начисление очков: чем меньше расстояние, тем больше очков (максимум 100)
    const maxScore = 100;
    const maxDistance = 500000; // 500 км
    const earned = Math.round(maxScore * Math.max(0, 1 - Math.min(distance, maxDistance) / maxDistance));

    setLastResult({ distance, earned });
    setScore(prev => prev + earned);
  };

  const handleNext = () => {
    pickRandomCity();
  };

  return (
    <div className="app">
      <Header score={score} onProfileClick={() => alert('Профиль')} />
      <div className="container">
        <Sidebar position="left">
          <h3>Левое меню</h3>
          <p>Здесь может быть что-то полезное</p>
        </Sidebar>

        <MapComponent
          currentCity={currentCity}
          guessedCoords={guessedCoords}
          onMapClick={handleMapClick}
          showLine={lastResult !== null}
        />

        <Sidebar position="right">
          <h3>Найди город</h3>
          {currentCity ? (
            <>
              <p><strong>Город:</strong> {currentCity.name}</p>
              <p><em>Нажмите на карту в предполагаемом месте города, затем нажмите "Подтвердить".</em></p>
              <button onClick={handleSubmit} disabled={!guessedCoords}>
                Подтвердить
              </button>
              {lastResult && (
                <div style={{ marginTop: '15px' }}>
                  <p>Расстояние: {(lastResult.distance / 1000).toFixed(1)} км</p>
                  <p>Получено очков: {lastResult.earned}</p>
                </div>
              )}
              <button onClick={handleNext} style={{ marginTop: '15px' }}>
                Следующий город
              </button>
            </>
          ) : (
            <p>Загрузка...</p>
          )}
        </Sidebar>
      </div>
      <Footer />
    </div>
  );
}

export default App;
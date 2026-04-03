import fetch from 'node-fetch';

export default async function fetchEnhancedWeather(zipCode) {
  console.log(`⛅ Fetching enhanced weather for zip code: ${zipCode || 'N/A'}`);
  try {
    let lat = 33.5021; // Fallback: Augusta National
    let lon = -82.0226;

    // 1. Convert Zip to Lat/Lon using a free geocoder
    if (zipCode) {
      const geoRes = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        lat = geoData.places[0].latitude;
        lon = geoData.places[0].longitude;
      }
    }

    // 2. Fetch rich data from Open-Meteo (Free, no API Key needed)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    // Map WMO codes back to simple strings for your frontend icons
    const code = data.current.weather_code;
    let condition = 'Clear';
    if (code >= 1 && code <= 3) condition = 'Cloudy';
    if (code >= 45 && code <= 48) condition = 'Foggy';
    if (code >= 51 && code <= 67) condition = 'Rain';
    if (code >= 71 && code <= 77) condition = 'Snow';
    if (code >= 95) condition = 'Thunderstorm';

    // Convert degrees to cardinal direction
    const deg = data.current.wind_direction_10m;
    const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dir = cardinals[Math.round(deg / 45) % 8];

    // Safely parse 24h time strings (e.g. "2026-04-03T07:12" -> "7:12 AM")
    const formatTime = (isoString) => {
      const timeStr = isoString.split('T')[1];
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      return `${hour % 12 || 12}:${m} ${ampm}`;
    };

    console.log('☀️ Enhanced weather data fetched successfully');

    return {
      conditionId: condition,
      temperature: Math.round(data.current.temperature_2m),
      highTemperature: Math.round(data.daily.temperature_2m_max[0]),
      lowTemperature: Math.round(data.daily.temperature_2m_min[0]),
      windSpeed: Math.round(data.current.wind_speed_10m),
      gust: Math.round(data.current.wind_gusts_10m),
      windDirection: dir,
      precipitation: data.daily.precipitation_probability_max[0],
      sunrise: formatTime(data.daily.sunrise[0]),
      sunset: formatTime(data.daily.sunset[0]),
    };
  } catch (err) {
    console.error('🌧️ Enhanced weather fetch failed', err);
    return null;
  }
}

import React from 'react';
import { useScores } from '../../../../../context/ScoreContext';

// MUI Icons
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AirOutlinedIcon from '@mui/icons-material/AirOutlined';
import WbTwilightOutlinedIcon from '@mui/icons-material/WbTwilightOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import NorthIcon from '@mui/icons-material/North';

import './styles.scss';

const getWeatherIcon = (conditionId: string | null) => {
  if (!conditionId) return <WbSunnyOutlinedIcon fontSize="large" />;
  const condition = conditionId.toLowerCase();

  if (condition.includes('cloud') || condition.includes('fog'))
    return <CloudOutlinedIcon fontSize="large" />;
  if (condition.includes('sun') || condition.includes('clear'))
    return <WbSunnyOutlinedIcon fontSize="large" />;
  if (condition.includes('rain') || condition.includes('snow'))
    return <WaterDropOutlinedIcon fontSize="large" />;
  if (condition.includes('storm')) return <ThunderstormOutlinedIcon fontSize="large" />;
  if (condition.includes('wind')) return <AirOutlinedIcon fontSize="large" />;

  return <WbTwilightOutlinedIcon fontSize="large" />;
};

const getWindRotation = (dir: string | null) => {
  if (!dir) return 0;

  // Maps standard 16-point compass directions to degrees
  const compassMap: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };

  return compassMap[dir.toUpperCase()] ?? 0;
};

export const DashboardWeatherPanel: React.FC = () => {
  const { tournamentMetadata } = useScores();
  const weather = tournamentMetadata?.weather;

  if (!weather || !weather.temperature) return null;

  return (
    <div className="dashboard-panel weather-panel">
      <div className="panel-lower">
        <div className="weather-container">
          <div className="weather-header">
            <div className="weather-icon">{getWeatherIcon(weather.conditionId)}</div>
            <div className="temperature-block">
              <span className="temp-main">{weather.temperature}°</span>
              <span className="condition-text">{weather.conditionId}</span>
            </div>
          </div>

          <div className="weather-stats">
            <div className="info-row">
              <span className="info-label">Daily H/L</span>
              <span className="info-value">
                {weather.highTemperature}° / {weather.lowTemperature}°
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Precipitation</span>
              <span className="info-value">{weather.precipitation}%</span>
            </div>

            <div className="info-row">
              <span className="info-label">Wind</span>
              <span className="info-value">
                {weather.windDirection && (
                  <NorthIcon
                    sx={{
                      fontSize: 16,
                      transform: `rotate(${getWindRotation(weather.windDirection)}deg)`,
                      transition: 'transform 0.3s ease',
                    }}
                    className="wind-direction-icon"
                  />
                )}
                {weather.windDirection} {weather.windSpeed} mph
                <span className="info-subtext">
                  {weather.gust ? ` (Gusts ${weather.gust} mph)` : ''}
                </span>
              </span>
            </div>

            {/* NEW SUNRISE / SUNSET ROW */}
            {(weather.sunrise || weather.sunset) && (
              <div className="info-row">
                <span className="info-label">Sun</span>
                <span className="info-value">
                  <LightModeOutlinedIcon sx={{ fontSize: 16 }} className="sun-time-icon" />
                  {weather.sunrise}
                  <span className="sun-time-divider">|</span>
                  <DarkModeOutlinedIcon sx={{ fontSize: 16 }} className="sun-time-icon" />
                  {weather.sunset}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

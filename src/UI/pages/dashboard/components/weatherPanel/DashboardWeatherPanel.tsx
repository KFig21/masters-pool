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
                {weather.windDirection} {weather.windSpeed} mph
                <span className="info-subtext" style={{ paddingLeft: '2px' }}>
                  {weather.gust ? ` (Gusts ${weather.gust} mph)` : ''}
                </span>
              </span>
            </div>

            {/* NEW SUNRISE / SUNSET ROW */}
            {(weather.sunrise || weather.sunset) && (
              <div className="info-row">
                <span className="info-label">Sun</span>
                <span className="info-value sun-times">
                  <LightModeOutlinedIcon sx={{ fontSize: 16, mr: 0.5, mb: '-3px' }} />
                  {weather.sunrise}
                  <span style={{ margin: '0 6px', opacity: 0.5 }}>|</span>
                  <DarkModeOutlinedIcon sx={{ fontSize: 16, mr: 0.5, mb: '-3px' }} />
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

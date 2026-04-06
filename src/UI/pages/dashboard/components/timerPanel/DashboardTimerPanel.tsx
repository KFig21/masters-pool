import { useState, useEffect } from 'react';
import './styles.scss';

interface DashboardTimerPanelProps {
  isTournamentActive: boolean;
  nextUpdate: string | number | null;
  targetDateStr: string | null;
}

export const DashboardTimerPanel = ({
  isTournamentActive,
  nextUpdate,
  targetDateStr,
}: DashboardTimerPanelProps) => {
  const [now, setNow] = useState(new Date().getTime());

  // Keep the timer synced globally for this component
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------
  // STATE 1: TOURNAMENT IS ACTIVE (Next Update)
  // ------------------------------------------
  if (isTournamentActive) {
    if (!nextUpdate) return null;

    const targetTime = new Date(nextUpdate).getTime();
    const distance = targetTime - now;

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Determine state classes
    let timerStatusClass = '';
    if (distance < 11000) {
      timerStatusClass = 'critical';
    } else if (distance < 31000) {
      timerStatusClass = 'low-time';
    }

    if (distance <= 0) {
      return (
        <div className="dashboard-panel">
          <div className={`panel-lower timer-display updating`}>
            <span>Updating Scores...</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`dashboard-panel ${timerStatusClass}`}>
        <div className={`panel-lower timer-display ${timerStatusClass}`}>
          <div className="next-update">NEXT UPDATE</div>
          <div className="time-section">
            <span className="timer-digit">{minutes}</span>
          </div>
          <div className="time-section">
            <span className="timer-digit">:</span>
          </div>
          <div className="time-section">
            <span className="timer-digit">{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // STATE 2: TOURNAMENT IS IN FUTURE (Tee Time)
  // ------------------------------------------
  if (!targetDateStr) return null;

  const targetTime = new Date(`${targetDateStr}T07:15:00-05:00`).getTime();
  const distance = targetTime - now;

  // Hide if the event has already started but isTournamentActive is somehow false
  if (distance <= 0) return null;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const showDays = days > 0;
  const showHours = hours > 0;
  const showMinutes = minutes > 0;

  return (
    <div className="dashboard-panel">
      <div className="panel-upper">
        <div className="panel-header">Tee Time</div>
      </div>
      <div className="panel-lower timer-display">
        {showDays && (
          <div className="time-section">
            <span className="timer-digit">{days}</span>
            <span className="timer-label">d</span>
          </div>
        )}
        {(showDays || showHours) && (
          <div className="time-section">
            <span className="timer-digit">{hours}</span>
            <span className="timer-label">h</span>
          </div>
        )}
        {(showDays || showHours || showMinutes) && (
          <div className="time-section">
            <span className="timer-digit">{minutes}</span>
            <span className="timer-label">m</span>
          </div>
        )}
        <div className="time-section">
          <span className="timer-digit">{seconds.toString().padStart(2, '0')}</span>
          <span className="timer-label">s</span>
        </div>
      </div>
    </div>
  );
};

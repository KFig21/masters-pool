// masters-pool/src/UI/components/countdown/Countdown.tsx

import { useState, useEffect } from 'react';
import './styles.scss';

interface CountdownProps {
  targetDateStr: string | null;
}

export const Countdown = ({ targetDateStr }: CountdownProps) => {
  // Track the current time to trigger re-renders
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    if (!targetDateStr) return;

    // TODO: ADD A TARGET TIME TO EACH EVENT
    const targetTime = new Date(`${targetDateStr}T07:15:00-05:00`).getTime();

    // If the date is already in the past, no need to run the interval at all
    if (targetTime <= new Date().getTime()) {
      return;
    }

    // Keep the timer synced
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date().getTime());

    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (!targetDateStr) return null;

  const targetTime = new Date(`${targetDateStr}T07:15:00-05:00`).getTime();
  const distance = targetTime - now;

  // Check distance during the render phase to completely prevent the 0d 0h 0m 0s flash
  if (distance <= 0) return null;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const showDays = days > 0;
  const showHours = hours > 0;
  const showMinutes = minutes > 0;

  return (
    <div className="footer-center countdown">
      <span className="label">Tee Time:</span>
      <span className="time">
        {/* DAYS */}
        {showDays && (
          <div className="time-section">
            <span className="timer-digit">{days}</span>
            <span className="timer-label">d</span>
          </div>
        )}
        {/* HOURS */}
        {(showDays || showHours) && (
          <div className="time-section">
            <span className="timer-digit">{hours}</span>
            <span className="timer-label">h</span>
          </div>
        )}
        {/* MINUTES */}
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
      </span>
    </div>
  );
};

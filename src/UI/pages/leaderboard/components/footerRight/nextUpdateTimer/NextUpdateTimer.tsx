import { useState, useEffect } from 'react';

interface NextUpdateTimerProps {
  targetDateStr: string | null;
}

export const NextUpdateTimer = ({ targetDateStr }: NextUpdateTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [isLowTime, setIsLowTime] = useState(false);

  useEffect(() => {
    if (!targetDateStr) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft('--:--');
      setIsLowTime(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();

      // Add the 5-second (5000ms) buffer to align with the ScoreContext fetch schedule.
      // The server starts scraping at targetDateStr, so we delay the visual 0:00
      // until the data is actually ready to be fetched.
      const target = new Date(targetDateStr).getTime() + 5000;
      const diff = target - now;

      // Determine if we are in the "warning" zone (below 30s)
      // We also keep it yellow while "Updating..." (diff <= 0)
      setIsLowTime(diff < 30000);

      if (diff <= 0) {
        setTimeLeft('Updating...');
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    // Cleanup interval on unmount or when targetDateStr changes
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <div className="update-info">
      <span className="label">NEXT UPDATE</span>
      <span className={`value ${isLowTime ? 'low-time' : ''}`}>{timeLeft}</span>
    </div>
  );
};

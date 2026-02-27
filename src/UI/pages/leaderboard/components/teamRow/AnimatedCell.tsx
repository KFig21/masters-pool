/* eslint-disable react-hooks/set-state-in-effect */
// masters-pool/src/UI/pages/leaderboard/components/teamRow/AnimatedCell.tsx

import { useState, useEffect, useRef } from 'react';

interface AnimatedCellProps {
  value: string | number;
  className?: string;
  isTied?: boolean;
}

// MATCH THE SCSS EXACTLY
const SLIDE_MS = 500;
const HOLD_MS = 1000;
const TOTAL_DURATION_MS = SLIDE_MS * 2 + HOLD_MS;

// Swap exactly in the middle of the 1.5s black-out hold
const SWAP_TIME_MS = SLIDE_MS + HOLD_MS / 2;

export const AnimatedCell = ({ value, className = '', isTied = false }: AnimatedCellProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // Only trigger if the value actually changes
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setIsAnimating(true);

      // The "Magic" swap happens while the tile is hidden
      const swapTimer = setTimeout(() => {
        setDisplayValue(value);
      }, SWAP_TIME_MS);

      const endTimer = setTimeout(() => {
        setIsAnimating(false);
      }, TOTAL_DURATION_MS);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(endTimer);
      };
    }
  }, [value]);

  return (
    <div className={`${className} ${isAnimating ? 'is-animating-cell' : ''}`}>
      <span className="score-tile-inner">
        {isTied && <span className="is-tied">T-</span>}
        {displayValue}
      </span>
    </div>
  );
};

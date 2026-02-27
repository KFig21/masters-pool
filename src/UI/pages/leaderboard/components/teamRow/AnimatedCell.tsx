// masters-pool/src/UI/pages/leaderboard/components/teamRow/AnimatedCell.tsx

import { useState, useEffect, useRef } from 'react';

interface AnimatedCellProps {
  value: string | number;
  className?: string;
  animationTrigger?: string | number;
  isTied?: boolean;
}

const FLASH_MS = 600;
const PAUSE_MS = 300;
const FLIP_MS = 1200;
const HOLD_MS = 800;
const FADE_MS = 200;

const TOTAL_DURATION_MS = FLASH_MS + PAUSE_MS + FLIP_MS + HOLD_MS + FADE_MS;
const SWAP_TIME_MS = FLASH_MS + PAUSE_MS + FLIP_MS / 2;

export const AnimatedCell = ({
  value,
  className = '',
  animationTrigger,
  isTied = false,
}: AnimatedCellProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);
  const prevTriggerRef = useRef(animationTrigger);

  useEffect(() => {
    const valueChanged = value !== prevValueRef.current;
    const triggerChanged =
      animationTrigger !== undefined && animationTrigger !== prevTriggerRef.current;

    if (valueChanged || triggerChanged) {
      prevValueRef.current = value;
      prevTriggerRef.current = animationTrigger;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(true);

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
  }, [value, animationTrigger]);

  // Apply the animating class to the OUTER div (the .cell)
  return (
    <div className={`${className} ${isAnimating ? 'is-animating-cell' : ''}`}>
      <span className="score-tile-inner">
        {isTied && <span className="is-tied">T-</span>}
        {displayValue}
      </span>
    </div>
  );
};

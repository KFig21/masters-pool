import { useState, useEffect, useRef } from 'react';

interface AnimatedCellProps {
  value: string | number;
  className?: string;
  // Optional trigger to force an animation even if the value stays the same
  animationTrigger?: string | number;
  isTied?: boolean;
}

export const AnimatedCell = ({
  value,
  className = '',
  animationTrigger,
  isTied = false,
}: AnimatedCellProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  // useRef safely tracks previous values without triggering re-renders
  const prevValueRef = useRef(value);
  const prevTriggerRef = useRef(animationTrigger);

  useEffect(() => {
    const valueChanged = value !== prevValueRef.current;
    const triggerChanged =
      animationTrigger !== undefined && animationTrigger !== prevTriggerRef.current;

    // Fire the animation if the value changed OR if the trigger changed
    if (valueChanged || triggerChanged) {
      prevValueRef.current = value;
      prevTriggerRef.current = animationTrigger;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(true);

      const swapTimer = setTimeout(() => {
        setDisplayValue(value);
      }, 300);

      const endTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);

      return () => {
        clearTimeout(swapTimer);
        clearTimeout(endTimer);
      };
    }
  }, [value, animationTrigger]); // Clean dependency array!

  return (
    <div className={className}>
      <span className={`score-tile-inner ${isAnimating ? 'is-flipping' : ''}`}>
        {isTied && <span className="is-tied"> T-</span>}
        {displayValue}
      </span>
    </div>
  );
};

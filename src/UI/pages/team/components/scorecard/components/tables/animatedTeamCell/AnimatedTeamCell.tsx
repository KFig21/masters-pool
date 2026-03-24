import React, { useState, useEffect, useRef } from 'react';

interface Props {
  value: number | string | null | undefined; // The raw value to compare
  className?: string;
  children: React.ReactNode; // The formatted output to display
}

export const AnimatedTeamCell = ({ value, className = '', children }: Props) => {
  const [displayContent, setDisplayContent] = useState(children);
  const [animState, setAnimState] = useState<'idle' | 'improve' | 'worsen'>('idle');
  const [fadeClass, setFadeClass] = useState('');
  const prevValue = useRef(value);

  useEffect(() => {
    // Only trigger if we have a previous value and it has actually changed
    if (prevValue.current !== undefined && value !== prevValue.current) {
      const oldNum = Number(prevValue.current);
      const newNum = Number(value);

      let direction: 'idle' | 'improve' | 'worsen' = 'idle';

      // Golf logic: Lower is better (improve = green, worsen = red)
      if (!isNaN(oldNum) && !isNaN(newNum)) {
        if (newNum < oldNum) direction = 'improve';
        if (newNum > oldNum) direction = 'worsen';
      } else if (prevValue.current === null && !isNaN(newNum)) {
        // Player just started their round
        direction = newNum <= 0 ? 'improve' : 'worsen';
      }

      if (direction !== 'idle') {
        setAnimState(direction);

        // Timeline Step 1: 0ms -> CSS handles the double flash and hold

        // Timeline Step 2: 600ms -> Fade the old text out
        setTimeout(() => setFadeClass('fade-out'), 600);

        // Timeline Step 3: 800ms -> Swap to the new value, start fading text in
        setTimeout(() => {
          setDisplayContent(children);
          setFadeClass('fade-in');
        }, 900);

        // Timeline Step 4: 1100ms -> Drop the background color and finish fade
        setTimeout(() => {
          setAnimState('idle');
          setFadeClass('');
        }, 1400);
      } else {
        setDisplayContent(children);
      }
    } else if (animState === 'idle') {
      // Keep content synced if parent re-renders without a value change
      setDisplayContent(children);
    }

    prevValue.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, children]);

  return (
    <div className={`${className} anim-cell ${animState}`}>
      <span className={`anim-content ${fadeClass}`}>{displayContent}</span>
    </div>
  );
};

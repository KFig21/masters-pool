/* eslint-disable react-hooks/set-state-in-effect */
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
  // Keep a ref of the absolute latest children to avoid stale closures in timeouts
  const latestChildren = useRef(children);

  // 1. Always keep our ref synced with the latest render
  useEffect(() => {
    latestChildren.current = children;
    // Keep content perfectly synced if the user toggles view modes (Strokes vs Par)
    // while the component is resting
    if (animState === 'idle') {
      setDisplayContent(children);
    }
  }, [children, animState]);

  // 2. Only fire the animation sequence when the underlying raw value changes
  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    if (prevValue.current !== undefined && value !== prevValue.current) {
      const oldNum = Number(prevValue.current);
      const newNum = Number(value);

      let direction: 'idle' | 'improve' | 'worsen' = 'idle';

      if (!isNaN(oldNum) && !isNaN(newNum)) {
        if (newNum < oldNum) direction = 'improve';
        if (newNum > oldNum) direction = 'worsen';
      } else if (prevValue.current === null && !isNaN(newNum)) {
        direction = newNum <= 0 ? 'improve' : 'worsen';
      }

      if (direction !== 'idle') {
        setAnimState(direction);

        t1 = setTimeout(() => setFadeClass('fade-out'), 600);

        t2 = setTimeout(() => {
          // Use the REF here, not the scoped `children` prop!
          setDisplayContent(latestChildren.current);
          setFadeClass('fade-in');
        }, 900);

        t3 = setTimeout(() => {
          setAnimState('idle');
          setFadeClass('');
        }, 1400);
      }
    }

    prevValue.current = value;

    // CLEANUP: If value changes rapidly, clear the old timeouts so animations don't overlap
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [value]);

  return (
    <div className={`${className} anim-cell ${animState}`}>
      <span className={`anim-content ${fadeClass}`}>{displayContent}</span>
    </div>
  );
};

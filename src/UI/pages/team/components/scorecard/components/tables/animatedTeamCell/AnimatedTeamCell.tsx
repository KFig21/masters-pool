import React, { useState, useEffect, useRef } from 'react';
import './styles.scss';

interface Props {
  value: number | string | null | undefined;
  className?: string;
  children: React.ReactNode;
}

export const AnimatedTeamCell = ({ value, className = '', children }: Props) => {
  // 1. Initialize displayContent with children
  const [displayContent, setDisplayContent] = useState(children);
  const [animState, setAnimState] = useState<'idle' | 'improve' | 'worsen'>('idle');
  const [isFading, setIsFading] = useState(false);

  const prevValue = useRef(value);
  const latestChildren = useRef(children);

  // Keep latestChildren ref in sync so timeouts always have the fresh UI
  useEffect(() => {
    latestChildren.current = children;

    // If we aren't animating, update the display immediately (handles View Mode toggles)
    if (animState === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayContent(children);
    }
  }, [children, animState]);

  useEffect(() => {
    // Only trigger if value actually changed and it's not the first mount
    if (prevValue.current !== undefined && value !== prevValue.current) {
      const oldNum = Number(prevValue.current ?? 0);
      const newNum = Number(value ?? 0);

      let direction: 'improve' | 'worsen' | 'idle' = 'idle';

      // Golf Logic: Lower is better
      if (newNum < oldNum) direction = 'improve';
      else if (newNum > oldNum) direction = 'worsen';
      // Handle null -> value transitions
      else if (prevValue.current === null && value !== null) {
        direction = newNum <= 0 ? 'improve' : 'worsen';
      }

      if (direction !== 'idle') {
        // Start Animation Sequence
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnimState(direction);

        // Start text fade-out just before the swap
        const fadeTimer = setTimeout(() => setIsFading(true), 600);

        // The "Magic Swap": update text while background is solid color
        const swapTimer = setTimeout(() => {
          setDisplayContent(latestChildren.current);
          setIsFading(false); // Fade back in
        }, 900);

        // Reset everything
        const endTimer = setTimeout(() => {
          setAnimState('idle');
        }, 1400);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(swapTimer);
          clearTimeout(endTimer);
        };
      }
    }
    prevValue.current = value;
  }, [value]);

  return (
    <div className={`${className} anim-cell ${animState}`}>
      <span className={`anim-content ${isFading ? 'fade-out' : 'fade-in'}`}>{displayContent}</span>
    </div>
  );
};

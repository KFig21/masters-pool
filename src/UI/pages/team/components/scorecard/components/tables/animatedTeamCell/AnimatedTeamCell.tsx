/* eslint-disable react-hooks/refs */
import React, { useState, useEffect, useRef } from 'react';
import './styles.scss';

interface Props {
  value: number | string | null | undefined;
  className?: string;
  children: React.ReactNode;
}

const UNSET = Symbol('unset');

export const AnimatedTeamCell = ({ value, className = '', children }: Props) => {
  const [displayContent, setDisplayContent] = useState(children);
  const [flashKey, setFlashKey] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const animDirection = useRef<'idle' | 'improve' | 'worsen'>('idle');
  const prevValue = useRef<typeof value | typeof UNSET>(UNSET);
  const isAnimating = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const latestChildren = useRef(children);

  latestChildren.current = children;

  useEffect(() => {
    // 1. First render initialization
    if (prevValue.current === UNSET) {
      prevValue.current = value;
      return;
    }

    const oldVal = prevValue.current;
    const newVal = value;
    prevValue.current = newVal;

    // 2. If the value hasn't changed, we're not animating a score change.
    // We just update the content instantly (e.g., the parent re-rendered for another reason).
    if (oldVal === newVal) {
      if (!isAnimating.current) {
        setDisplayContent(children);
      }
      return;
    }

    // 3. Value HAS changed -> Determine animation direction
    const nOld = oldVal === null || oldVal === undefined ? null : Number(oldVal);
    const nNew = newVal === null || newVal === undefined ? null : Number(newVal);

    let direction: 'improve' | 'worsen' | 'idle' = 'idle';
    if (nNew !== null) {
      if (nOld === null) direction = 'improve';
      else if (nNew < nOld) direction = 'improve';
      else if (nNew > nOld) direction = 'worsen';
    }

    if (direction === 'idle') {
      setDisplayContent(children);
      return;
    }

    // 4. Trigger the full Animation Sequence
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    isAnimating.current = true;
    animDirection.current = direction;

    // Incrementing flashKey and putting it on the OUTER div forces React to
    // completely remount the element, guaranteeing the CSS animation restarts.
    setFlashKey((k) => k + 1);

    const t1 = setTimeout(() => setIsFading(true), 600);
    const t2 = setTimeout(() => {
      setDisplayContent(latestChildren.current);
      setIsFading(false);
    }, 900);
    const t3 = setTimeout(() => {
      animDirection.current = 'idle';
      isAnimating.current = false;
      // Force a render to strip the animation class
      setFlashKey((k) => k + 1);
    }, 1400);

    timersRef.current = [t1, t2, t3];

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [value, children]); // Depend on both to prevent the race condition

  return (
    <div key={flashKey} className={`${className} anim-cell ${animDirection.current}`}>
      <span className={`anim-content ${isFading ? 'fade-out' : 'fade-in'}`}>{displayContent}</span>
    </div>
  );
};

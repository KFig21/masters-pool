/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import './styles.scss';

// 1. DYNAMICALLY IMPORT IMAGES
const modules = import.meta.glob('../../../assets/images/backgrounds/*.{png,jpg,jpeg,svg}', {
  eager: true,
});

const rawImages = Object.values(modules).map((mod: any) => mod.default);

const shuffleArray = (array: string[]): string[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const DURATION_SECONDS = 30;
const TRANSITION_SECONDS = 2;

export const BackgroundSlider = () => {
  const shuffledImages = useMemo(() => shuffleArray(rawImages), []);

  const [activeIndex, setActiveIndex] = useState(() =>
    Math.floor(Math.random() * shuffledImages.length),
  );
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    if (shuffledImages.length <= 1) return;

    const interval = setInterval(() => {
      setPrevIndex(activeIndex);
      setActiveIndex((current) => (current + 1) % shuffledImages.length);
    }, DURATION_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [activeIndex, shuffledImages.length]);

  if (shuffledImages.length === 0) return null;

  // Logic to determine the "Next" image for preloading
  const nextIndex = (activeIndex + 1) % shuffledImages.length;

  return (
    <div className="background-slider">
      {shuffledImages.map((imgSrc, index) => {
        const isActive = index === activeIndex;
        const isPrev = index === prevIndex;
        const isNext = index === nextIndex;

        // LAZY LOAD LOGIC:
        // Only render the div if it is the current, previous, or next image.
        // Otherwise, return null so the browser doesn't fetch the asset.
        if (!isActive && !isPrev && !isNext) return null;

        return (
          <div
            key={imgSrc}
            className={`bg-slide ${isActive ? 'active' : ''} ${isPrev ? 'exiting' : ''} ${isNext ? 'preload' : ''}`}
            style={{
              backgroundImage: `url(${imgSrc})`,
              transition: `opacity ${TRANSITION_SECONDS}s ease-in-out`,
              animationDuration: `${DURATION_SECONDS + 5}s`,
            }}
          />
        );
      })}
      <div className="bg-overlay" />
    </div>
  );
};

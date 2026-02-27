// masters-pool/src/UI/pages/leaderboard/components/AnimationTester.tsx
import { useState } from 'react';
import { AnimatedCell } from './teamRow/AnimatedCell';
import './teamRow/styles.scss'; // Reuse the existing styles

export const AnimationTester = () => {
  const [testValue, setTestValue] = useState(10);
  const [isTied, setIsTied] = useState(false);
  const [rank, setRank] = useState(1);

  const triggerUpdate = () => {
    // Cycle through a few values to see color changes (under par, even, over)
    const values = [10, 0, -5, 'CUT'];
    const currentIndex = values.indexOf(testValue);
    const nextValue = values[(currentIndex + 1) % values.length];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setTestValue(nextValue as any);
    setIsTied(Math.random() > 0.5);
    setRank((prev) => (prev === 1 ? 2 : 1));
  };

  const getScoreClass = (score: number | string) => {
    if (score === 'CUT') return 'cut-text';
    if (typeof score === 'string') return '';
    if (score < 0) return 'under-par';
    if (score === 0) return 'even-par';
    return 'over-par';
  };

  const formatScore = (score: number | string) => {
    if (score === 0) return 'E';
    if (typeof score === 'number' && score < 0) return `${score.toString().slice(1)}`;
    return score;
  };

  return (
    <div
      className="animation-tester-container"
      style={{ margin: '20px 0', borderBottom: '2px dashed var(--scoreboard-borderColor)' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 10px 10px',
        }}
      >
        <h4
          style={{
            color: '#fff',
            margin: 0,
            fontFamily: 'Oswald',
            fontSize: '14px',
            letterSpacing: '1px',
          }}
        >
          LIVE ANIMATION PREVIEW
        </h4>
        <button
          onClick={triggerUpdate}
          style={{
            padding: '4px 12px',
            backgroundColor: 'var(--green)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Oswald',
            fontSize: '12px',
          }}
        >
          TRIGGER UPDATE
        </button>
      </div>

      {/* This mimics the exact DOM structure of a TeamRow */}
      <div className="teamRow-wrapper">
        <div className="teamRow-container" style={{ cursor: 'default' }}>
          <AnimatedCell className="cell rank" value={rank} isTied={isTied} />

          <AnimatedCell className="cell name" value="TEST" animationTrigger={rank} />

          {/* Dummy Rounds */}
          <div className="cell score even-par">72</div>
          <div className="cell score under-par">68</div>
          <div className="cell score over-par">75</div>
          <div className="cell score">-</div>

          {/* The Animated Target */}
          <AnimatedCell
            className={`cell score total ${getScoreClass(testValue)}`}
            value={formatScore(testValue)}
          />
        </div>
      </div>

      <p
        style={{
          color: '#888',
          fontSize: '10px',
          textAlign: 'center',
          marginTop: '8px',
          fontFamily: 'Work Sans',
        }}
      >
        Sequence: Double Flash → Slide Down → Tile Swap → Slide In From Top
      </p>
    </div>
  );
};

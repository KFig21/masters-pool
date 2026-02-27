// masters-pool/src/UI/pages/leaderboard/components/AnimationTester.tsx
import { useState } from 'react';
import { AnimatedCell } from './teamRow/AnimatedCell';

export const AnimationTester = () => {
  const [testValue, setTestValue] = useState(10);
  const [isTied, setIsTied] = useState(false);

  const triggerUpdate = () => {
    // Change the value to trigger the animation
    setTestValue((prev) => (prev === 10 ? -2 : 10));
    // Randomly toggle tie status to test the T- prefix swap
    setIsTied(Math.random() > 0.5);
  };

  return (
    <div
      style={{
        padding: '20px',
        // background: '#1a1a1a',
        borderRadius: '8px',
        margin: '20px auto',
        width: 'fit-content',
        textAlign: 'center',
        border: '1px solid #444',
      }}
    >
      <h4 style={{ color: '#fff', marginBottom: '15px', fontFamily: 'Oswald' }}>
        ANIMATION TESTER
      </h4>

      <div style={{ marginBottom: '20px' }}>
        <AnimatedCell
          className="cell score total"
          value={testValue === 0 ? 'E' : testValue}
          isTied={isTied}
        />
      </div>

      <button
        onClick={triggerUpdate}
        style={{
          padding: '8px 16px',
          backgroundColor: '#00703c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontFamily: 'Work Sans',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        Trigger Score Update
      </button>

      <p style={{ color: '#666', fontSize: '11px', marginTop: '10px' }}>
        Flash (0.6s) → Pause (0.3s) → Slow Flip (0.9s)
      </p>
    </div>
  );
};

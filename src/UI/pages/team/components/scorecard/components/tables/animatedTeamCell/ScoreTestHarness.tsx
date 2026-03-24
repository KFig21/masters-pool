import React, { useState } from 'react';
import './styles.scss';
import { AnimatedTeamCell } from './AnimatedTeamCell';

export const ScoreTestHarness = () => {
  const [score, setScore] = useState(0);
  const [roundScore, setRoundScore] = useState(72);
  const [teamTotal, setTeamTotal] = useState(-4);

  const formatScore = (val: number) => {
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val.toString();
  };

  return (
    <div style={{ padding: '40px', background: '#0a2a1e', minHeight: '100vh', color: 'white' }}>
      <h2 style={{ fontFamily: 'Tiempo, serif', color: '#ecc00d' }}>
        Scorecard Animation Laboratory
      </h2>
      <p style={{ marginBottom: '20px', opacity: 0.8 }}>
        Trigger the values below to verify the <b>double-flash</b> and <b>text crossfade</b> logic.
      </p>

      <div className="scorecard-table-container" style={{ maxWidth: '900px' }}>
        {/* Header Simulation */}
        <div className="scorecard-table-row header">
          <div className="scorecard-table-cell name-col">Scenario</div>
          <div className="scorecard-table-cell">Animated Cell</div>
          <div className="scorecard-table-cell name-col" style={{ justifyContent: 'center' }}>
            Trigger Update
          </div>
        </div>

        {/* Row 1: Individual Score */}
        <div className="scorecard-table-row">
          <div className="scorecard-table-cell name-cell">Individual Total</div>
          <AnimatedTeamCell
            value={score}
            className={`scorecard-table-cell end-col ${score > -1 ? 'over' : 'under'}`}
          >
            {formatScore(score)}
          </AnimatedTeamCell>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setScore((s) => s - 1)} style={btnStyle('improve')}>
              Improve (-1)
            </button>
          </div>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setScore((s) => s + 1)} style={btnStyle('worsen')}>
              Worsen (+1)
            </button>
          </div>
        </div>

        {/* Row 2: Round Strokes */}
        <div className="scorecard-table-row">
          <div className="scorecard-table-cell name-cell">Round Strokes (R1)</div>
          <AnimatedTeamCell
            value={roundScore}
            className={`scorecard-table-cell stroke ${roundScore > 71 ? 'over' : 'under'}`}
          >
            {roundScore}
          </AnimatedTeamCell>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setRoundScore((s) => s - 1)} style={btnStyle('improve')}>
              Birdie
            </button>
          </div>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setRoundScore((s) => s + 1)} style={btnStyle('worsen')}>
              Bogey
            </button>
          </div>
        </div>

        {/* Row 3: Team Total */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM TOTAL</div>
          <AnimatedTeamCell
            value={teamTotal}
            className={`scorecard-table-cell end-col ${teamTotal > -1 ? 'over' : 'under'}`}
          >
            {formatScore(teamTotal)}
          </AnimatedTeamCell>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setTeamTotal((s) => s - 2)} style={btnStyle('improve')}>
              Great Round
            </button>
          </div>
          <div
            className="scorecard-table-cell name-col"
            style={{ gap: '10px', justifyContent: 'center' }}
          >
            <button onClick={() => setTeamTotal((s) => s + 2)} style={btnStyle('worsen')}>
              Tough Day
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', fontSize: '0.9rem', color: '#809e90' }}>
        <p>
          <b>Note:</b> The "old value" will stay visible during the first 600ms of the background
          flash,
        </p>
        <p>then it will fade out, swap to the new value, and fade back in by 1100ms.</p>
      </div>
    </div>
  );
};

// Quick button styles for the test harness
const btnStyle = (type: 'improve' | 'worsen') => ({
  padding: '6px 12px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: 'none',
  background: type === 'improve' ? '#2ecc71' : '#e74c3c',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  transition: 'transform 0.1s active',
});

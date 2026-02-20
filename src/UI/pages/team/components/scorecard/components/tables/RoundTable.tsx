import type { Golfer } from '../../../../../../../data/teams';
import type { TeamStats } from '../../../../../../../context/ScoreContext';
import './styles.scss';
import { useState } from 'react';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export type ViewMode = 'relative' | 'strokes';

export const RoundTable = ({ golfers, stats }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('relative');
  const rounds = [1, 2, 3, 4] as const;

  console.log('stats', stats);

  // Formatting Helper
  const getCellData = (golfer: Golfer, roundNum: 1 | 2 | 3 | 4) => {
    const roundKey = `round${roundNum}` as keyof typeof golfer.scorecard;
    const data = golfer.scorecard[roundKey];

    if (!data) return { val: '-', class: '' };

    if (viewMode === 'strokes') {
      // If we have a total (68), show it. If not, show '-'
      const val = data.total ? data.total : '-';
      return { val, class: 'neutral' };
    } else {
      // Relative Mode (-3, E, +2)
      // Use scoreRound if available
      const val = data.scoreRound;

      if (val === null || val === undefined) return { val: '-', class: '' };
      if (val === 0) return { val: 'E', class: 'even' };

      const isUnder = val < 0;
      return {
        val: isUnder ? val : `+${val}`,
        class: isUnder ? 'under' : 'over',
      };
    }
  };

  // Helper for Team Daily Aggregate
  const getTeamDaily = (rNum: number) => {
    // Team Stats are always calculated relative to par in your context
    // We calculate the diff from previous round total
    const prevSum = rNum === 1 ? 0 : (stats[`sumR${rNum - 1}` as keyof TeamStats] as number);
    const currSum = stats[`sumR${rNum}` as keyof TeamStats] as number;

    if (currSum === Infinity || prevSum === Infinity) return null;
    return currSum - prevSum;
  };

  const formatTeamVal = (val: number | null) => {
    if (val === null) return '-';
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  const getTeamClass = (val: number | null) => {
    if (val === null) return '';
    if (val === 0) return 'even';
    return val < 0 ? 'under' : 'over';
  };

  return (
    <div className="scorecard-section-container">
      {/* Controls Header */}
      <div className="scorecard-controls">
        <div className="section-title">Round Scores</div>
        <div className="toggle-container">
          <span className={viewMode === 'relative' ? 'active' : ''}>To Par</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={viewMode === 'strokes'}
              onChange={() => setViewMode((prev) => (prev === 'relative' ? 'strokes' : 'relative'))}
            />
            <span className="slider round"></span>
          </label>
          <span className={viewMode === 'strokes' ? 'active' : ''}>Strokes</span>
        </div>
      </div>

      <div className="scorecard-table-container">
        {/* Table Header */}
        <div className="scorecard-table-row header">
          {/* Golfers Column */}
          <div className="scorecard-table-cell name-col"></div>
          {/* Round Columns */}
          {rounds.map((round) => (
            <div key={round} className="scorecard-table-cell">
              R{round}
            </div>
          ))}
          {/* Total Column */}
          <div className="scorecard-table-cell">Score</div>
        </div>

        {/* Golfers */}
        {golfers.map((golfer, index) => {
          // Top 4 get a thick border
          const isCutoff = index === 3;

          return (
            <div
              key={golfer.id}
              className={`scorecard-table-row ${isCutoff ? 'cutoff-border' : ''} ${golfer.isCut ? 'is-cut' : ''}`}
            >
              {/* Golfer Name */}
              <div className="scorecard-table-cell name-cell">
                <span className="golfer-name">{golfer.name}</span>
                {golfer.isCut && <span className="cut-badge">CUT</span>}
              </div>

              {/* Round Columns */}
              {rounds.map((round) => {
                const { val, class: colorClass } = getCellData(golfer, round);
                return (
                  <div key={round} className={`scorecard-table-cell stroke ${colorClass}`}>
                    {val}
                  </div>
                );
              })}

              {/* Total Column */}
              <div
                className={`scorecard-table-cell end-col ${golfer.score === 0 ? 'even' : (golfer.score || 0) < 0 ? 'under' : 'over'}`}
              >
                {golfer.displayScore}
              </div>
            </div>
          );
        })}

        {/* Team Daily Row */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM DAILY</div>
          {rounds.map((r) => {
            const val = getTeamDaily(r);
            return (
              <div key={r} className={`scorecard-table-cell ${getTeamClass(val)}`}>
                {formatTeamVal(val)}
              </div>
            );
          })}
          <div className="scorecard-table-cell end-col">-</div>
        </div>
      </div>
    </div>
  );
};

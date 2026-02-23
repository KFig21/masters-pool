import type { Golfer } from '../../../../../../../data/teams';
import type { TeamStats } from '../../../../../../../context/ScoreContext';
import { useState } from 'react';
import { ROUNDS } from '../../../../../../../constants/golf';
import { getScoreClass, formatTeamValue, getTeamClass } from '../../utils/formatters';
import './styles.scss';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export type ViewMode = 'relative' | 'strokes';

export const RoundTable = ({ golfers, stats }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('relative');

  // Formatting Helper specific to RoundTable's view modes
  const getCellData = (golfer: Golfer, round: number) => {
    const roundKey = `round${round}` as keyof typeof golfer.scorecard;
    const data = golfer.scorecard[roundKey];

    if (!data) return { val: '-', class: '', isCounting: false };

    const isCounting = !!data.isCountingScore;

    if (viewMode === 'strokes') {
      const strokeVal = data.total ? data.total : '-';
      const val = data.scoreRound;
      if (val === null || val === undefined) return { val: '-', class: '', isCounting };

      const isUnder = val < 0;
      return { val: strokeVal, class: isUnder ? 'under' : 'over', isCounting };
    } else {
      const val = data.scoreRound;
      if (val === null || val === undefined) return { val: '-', class: '', isCounting };
      if (val === 0) return { val: 'E', class: 'even', isCounting };

      const isUnder = val < 0;
      return {
        val: isUnder ? val : `+${val}`,
        class: isUnder ? 'under' : 'over',
        isCounting,
      };
    }
  };

  // Helper for Team Daily Aggregate
  const getTeamDaily = (rNum: number) => {
    const prevSum = rNum === 1 ? 0 : (stats[`sumR${rNum - 1}` as keyof TeamStats] as number);
    const currSum = stats[`sumR${rNum}` as keyof TeamStats] as number;

    if (currSum === Infinity || prevSum === Infinity) return null;
    return currSum - prevSum;
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
          {ROUNDS.map((round) => (
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
          const isTopFour = index < 4;
          const rowClass = isTopFour ? 'top-scorers' : 'not-top-scorers';

          return (
            <div
              key={golfer.id}
              className={`scorecard-table-row ${rowClass} ${isCutoff ? 'cutoff-border' : ''} ${golfer.isCut ? 'is-cut' : ''}`}
            >
              {/* Golfer Name */}
              <div className="scorecard-table-cell name-cell">
                <span className="golfer-name">{golfer.name}</span>
              </div>

              {/* Round Columns */}
              {ROUNDS.map((round) => {
                const { val, class: colorClass, isCounting } = getCellData(golfer, round);
                return (
                  <div
                    key={round}
                    className={`scorecard-table-cell stroke ${colorClass} ${isCounting ? 'counting-score' : ''}`}
                  >
                    {val}
                  </div>
                );
              })}

              {/* Total Column */}
              <div className={`scorecard-table-cell end-col ${getScoreClass(golfer.score)}`}>
                {golfer.displayScore}
              </div>
            </div>
          );
        })}

        {/* Team Daily Row */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM DAILY</div>
          {ROUNDS.map((r) => {
            const val = getTeamDaily(r);
            return (
              <div key={r} className={`scorecard-table-cell ${getTeamClass(val)}`}>
                {formatTeamValue(val)}
              </div>
            );
          })}
          <div
            className={`scorecard-table-cell end-col ${getTeamClass(stats.activeTotal).toLowerCase()}`}
          >
            {formatTeamValue(stats.activeTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};

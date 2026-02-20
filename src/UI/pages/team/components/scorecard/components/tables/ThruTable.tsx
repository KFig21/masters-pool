import type { Golfer } from '../../../../../../../data/teams';
import type { TeamStats } from '../../../../../../../context/ScoreContext';
import { ROUNDS } from '../../../../../../../constants/golf';
import {
  getScoreClass,
  formatRelativeScore,
  formatTeamValue,
  getTeamClass,
} from '../../utils/formatters';
import './styles.scss';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export const ThruTable = ({ golfers, stats }: Props) => {
  return (
    <div className="scorecard-section-container">
      <div className="scorecard-controls">
        <div className="section-title">Cumulative (Thru) Scores</div>
      </div>
      <div className="scorecard-table-container">
        {/* Header */}
        <div className="scorecard-table-row header">
          {/* Golfers Column */}
          <div className="scorecard-table-cell name-col"></div>
          {/* Round Columns */}
          {ROUNDS.map((round) => (
            <div key={round} className="scorecard-table-cell">
              thru {round}
            </div>
          ))}
          {/* Current Score Column */}
          <div className="scorecard-table-cell">Score</div>
        </div>

        {golfers.map((g, index) => {
          const isCutoff = index === 3;
          return (
            <div
              key={g.id}
              className={`scorecard-table-row ${isCutoff ? 'cutoff-border' : ''} ${g.isCut ? 'is-cut' : ''}`}
            >
              <div className="scorecard-table-cell name-cell">
                <span className="golfer-name">{g.name}</span>
                {g.isCut && <span className="cut-badge">CUT</span>}
              </div>

              {ROUNDS.map((r) => {
                const roundKey = `round${r}` as keyof typeof g.scorecard;
                const val = g.scorecard[roundKey]?.thruScore;
                return (
                  <div key={r} className={`scorecard-table-cell stroke ${getScoreClass(val)}`}>
                    {formatRelativeScore(val)}
                  </div>
                );
              })}

              <div className={`scorecard-table-cell end-col ${getScoreClass(g.score)}`}>
                {g.displayScore}
              </div>
            </div>
          );
        })}

        {/* Team Aggregate Row */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM TOTAL</div>
          {ROUNDS.map((r) => {
            const key = `sumR${r}` as keyof TeamStats;
            const val = stats[key] as number;
            const isValid = val !== Infinity;

            return (
              <div key={r} className={`scorecard-table-cell ${isValid ? getScoreClass(val) : ''}`}>
                {isValid ? formatRelativeScore(val) : '-'}
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

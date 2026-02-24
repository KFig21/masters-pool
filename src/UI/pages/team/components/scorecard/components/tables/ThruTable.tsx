import type { Golfer } from '../../../../../../../types/team';
import type { TeamStats } from '../../../../../../../context/ScoreContext';
import { ROUNDS } from '../../../../../../../constants/golf';
import {
  getScoreClass,
  formatRelativeScore,
  formatTeamValue,
  getTeamClass,
} from '../../utils/formatters';
import './styles.scss';
import { ThruBadge } from '../../../../../../components/thruBadge/ThruBadge';

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
              <span className="desktop-label">thru {round}</span>
              <span className="mobile-label">R{round}</span>
            </div>
          ))}
          {/* Current Score Column */}
          <div className="scorecard-table-cell">Score</div>
        </div>

        {golfers.map((golfer, index) => {
          const isCutoff = index === 3;
          const isTopFour = index < 4;
          const rowClass = isTopFour ? 'top-scorers' : 'not-top-scorers';

          return (
            <div
              key={golfer.id}
              className={`scorecard-table-row ${rowClass} ${isCutoff ? 'cutoff-border' : ''} ${golfer.isCut ? 'is-cut' : ''}`}
            >
              <div className="scorecard-table-cell name-cell">
                <span className="golfer-name">{golfer.name}</span>
                {/* Drop the badge right next to the name */}
                <ThruBadge
                  thru={golfer.thru}
                  isCut={golfer.isCut}
                  status={golfer.status}
                  // isTournamentComplete={/* Add your logic here if you have it in ScoreContext */}
                />
              </div>

              {/* UPDATED: Added isCounting logic and class to the cell */}
              {ROUNDS.map((r) => {
                const roundKey = `round${r}` as keyof typeof golfer.scorecard;
                const roundData = golfer.scorecard[roundKey];

                const val = roundData?.thruScore;
                const isCounting = !!roundData?.isCountingScore;

                return (
                  <div
                    key={r}
                    className={`scorecard-table-cell stroke ${getScoreClass(val, undefined)} ${isCounting ? 'counting-score' : ''}`}
                  >
                    {formatRelativeScore(val)}
                  </div>
                );
              })}

              <div
                className={`scorecard-table-cell end-col ${getScoreClass(golfer.score, golfer.isCut)}`}
              >
                {golfer.status !== 'ACTIVE' ? golfer.status : golfer.displayScore}
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
              <div
                key={r}
                className={`scorecard-table-cell ${isValid ? getScoreClass(val, undefined) : ''}`}
              >
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

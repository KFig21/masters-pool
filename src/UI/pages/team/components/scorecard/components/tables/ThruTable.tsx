import type { Golfer } from '../../../../../../../types/team';
import { useScores, type TeamStats } from '../../../../../../../context/ScoreContext';
import { ROUNDS } from '../../../../../../../constants/golf';
import {
  getScoreClass,
  formatRelativeScore,
  formatTeamValue,
  getTeamClass,
} from '../../utils/formatters';
import './styles.scss';
import { ThruBadge } from '../../../../../../components/thruBadge/ThruBadge';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from '../../../../../../../constants';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export const ThruTable = ({ golfers, stats }: Props) => {
  const { isTournamentComplete } = useScores();

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
          const CUT_LINE = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].cutLine;
          const isCutoff = index === CUT_LINE - 1;
          const isTopX = index < CUT_LINE;
          const rowClass = isTopX ? 'top-scorers' : 'not-top-scorers';

          return (
            <div
              key={golfer.id}
              className={`scorecard-table-row ${rowClass} ${isCutoff ? 'cutoff-border' : ''} ${golfer.isCut ? 'is-cut' : ''}`}
            >
              <div className="scorecard-table-cell name-cell">
                {/* Desktop Name */}
                <span className="golfer-name desktop-label">{golfer.name}</span>

                {/* Mobile Name (First Initial + Last Name) */}
                <span className="golfer-name mobile-label">
                  {golfer.name.split(' ').length > 1
                    ? `${golfer.name.split(' ')[0][0]}. ${golfer.name.split(' ').slice(1).join(' ')}`
                    : golfer.name}
                </span>
                {/* Drop the badge right next to the name */}
                <ThruBadge
                  thru={golfer.thru}
                  isCut={golfer.isCut}
                  status={golfer.status}
                  isTournamentComplete={isTournamentComplete}
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

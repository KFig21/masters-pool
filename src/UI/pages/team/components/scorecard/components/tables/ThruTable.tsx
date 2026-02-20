import type { Golfer } from '../../../../../../../data/teams';
import type { TeamStats } from '../../../../../../../context/ScoreContext';
import './styles.scss';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export const ThruTable = ({ golfers, stats }: Props) => {
  const rounds = [1, 2, 3, 4] as const;

  const formatScore = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  const getClass = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '';
    if (val === 0) return 'even';
    return val < 0 ? 'under' : 'over';
  };

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
          {rounds.map((round) => (
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

              {rounds.map((r) => {
                const roundKey = `round${r}` as keyof typeof g.scorecard;
                const val = g.scorecard[roundKey]?.thruScore;
                return (
                  <div key={r} className={`scorecard-table-cell stroke ${getClass(val)}`}>
                    {formatScore(val)}
                  </div>
                );
              })}

              <div className={`scorecard-table-cell end-col ${getClass(g.score)}`}>
                {g.displayScore}
              </div>
            </div>
          );
        })}

        {/* Team Aggregate Row */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM TOTAL</div>
          {rounds.map((r) => {
            // Access stats dynamically: sumR1, sumR2, etc.
            const key = `sumR${r}` as keyof TeamStats;
            const val = stats[key] as number;
            // If sum is Infinity, round isn't done/valid for team calc
            const isValid = val !== Infinity;

            return (
              <div key={r} className={`scorecard-table-cell ${isValid ? getClass(val) : ''}`}>
                {isValid ? formatScore(val) : '-'}
              </div>
            );
          })}
          <div
            className={`scorecard-table-cell end-col ${typeof stats.activeTotal === 'number' ? getClass(stats.activeTotal) : ''}`}
          >
            {stats.activeTotal === 999 ? 'E' : stats.activeTotal}
          </div>
        </div>
      </div>
    </div>
  );
};

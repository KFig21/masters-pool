import React, { useMemo } from 'react';
import type { ProcessedTeam } from '../../../../../context/ScoreContext';
import type { Golfer } from '../../../../../types/team';
import { useFavoriteTeam } from '../../../../../hooks/useFavoriteTeam';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner?: string | null;
}

export const DashboardGolferLeaderboard: React.FC<Props> = ({ teams, selectedOwner }) => {
  const { favoriteTeam } = useFavoriteTeam();
  const sortedGolfers = useMemo(() => {
    // 1. Flatten all golfers and attach their team owner
    const all = teams.flatMap((t) => t.golfers.map((g) => ({ ...g, teamOwner: t.owner })));

    // 2. Sort by total score (handle cuts/WDs by pushing to bottom)
    return all.sort((a, b) => {
      const getScore = (g: Golfer) => {
        if (g.isCut || g.status === 'WD' || g.status === 'DQ') return 999;
        return typeof g.score === 'number' ? g.score : 0; // fallback depending on your exact prop name
      };
      return getScore(a) - getScore(b);
    });
  }, [teams]);

  const formatScore = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === Infinity) return '-';
    if (typeof val === 'string') return val;
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  const getScoreClass = (val: number | string | null | undefined) => {
    if (val === 'CUT') return 'cut';
    if (typeof val !== 'number' || val === Infinity) return '';
    if (val < 0) return 'under-par';
    if (val > 0) return 'over-par';
    return 'even-par';
  };

  return (
    <div className="dashboard-panel golfer-panel">
      <div className="panel-upper">
        <div className="panel-header">Individual Leaderboard</div>
        <div className="leaderboard-header golfer-table">
          <div className="col header pos">POS</div>
          <div className="col header golfer">PLAYER</div>
          <div className="col header team">TEAM</div>
          <div className="col header round-score">R1</div>
          <div className="col header round-score">R2</div>
          <div className="col header round-score">R3</div>
          <div className="col header round-score">R4</div>
          <div className="col header total-score">TOT</div>
        </div>
      </div>
      <div className="panel-lower">
        <div className="mini-leaderboard">
          <div className="ml-body">
            {sortedGolfers.map((golfer, i) => {
              // Extract values for cleaner JSX below
              const r1Score = golfer.scorecard?.round1?.scoreRound;
              const r2Score = golfer.scorecard?.round2?.scoreRound;
              const r3Score = golfer.scorecard?.round3?.scoreRound;
              const r4Score = golfer.scorecard?.round4?.scoreRound;

              // Handle formatting priority for the final column
              const totalScore = golfer.isCut ? 'CUT' : golfer.score;

              return (
                <div
                  key={`${golfer.id}-${i}`}
                  className={`leaderboard-row golfer-table ${golfer.isCut ? 'cut-row' : ''} ${favoriteTeam === golfer.teamOwner ? 'favorite' : ''} ${selectedOwner === golfer.teamOwner ? 'selected' : ''}`}
                >
                  {/* Swapped <td> to <div> for valid Grid layout */}
                  <div className="col pos">{i + 1}</div>
                  <div className="col golfer">{golfer.name}</div>
                  <div className="col team">{golfer.teamOwner}</div>

                  {/* Apply both the value formatter and the class generator */}
                  <div className={`col round-score ${getScoreClass(r1Score)}`}>
                    {formatScore(r1Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r2Score)}`}>
                    {formatScore(r2Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r3Score)}`}>
                    {formatScore(r3Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r4Score)}`}>
                    {formatScore(r4Score)}
                  </div>
                  <div className={`col total-score ${getScoreClass(totalScore)}`}>
                    {formatScore(totalScore)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

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
    if (val === null || val === undefined) return '-';
    if (typeof val === 'string') return val;
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  return (
    <div className="dashboard-panel golfer-panel">
      <div className="panel-upper">
        <div className="panel-header">Individual Leaderboard</div>
        <div className="leaderboard-header golfer-table">
          <div className="col header pos">POS</div>
          <div className="col header golfer">PLAYER</div>
          <div className="col header team">TEAM</div>
          <th className="col header round-score">R1</th>
          <th className="col header round-score">R2</th>
          <th className="col header round-score">R3</th>
          <th className="col header round-score">R4</th>
          <th className="col header total-score">TOT</th>
        </div>
      </div>
      <div className="panel-lower">
        <div className="mini-leaderboard">
          <div className="ml-body">
            {sortedGolfers.map((golfer, i) => (
              <div
                key={`${golfer.id}-${i}`}
                className={`leaderboard-row golfer-table ${golfer.isCut ? 'cut-row' : ''} ${favoriteTeam === golfer.teamOwner ? 'favorite' : ''} ${selectedOwner === golfer.teamOwner ? 'selected' : ''}`}
              >
                {/* <td>{golfer.position || '-'}</td> */}
                {/* ADD A POSITION */}
                {/* FIX: THE POSITION is just a placeholder, needs to be calc'd */}
                <td className="col pos">{`${i + 1}`}</td>{' '}
                <td className="col golfer">{golfer.name}</td>
                <td className="col team">{golfer.teamOwner}</td>
                <td className="col round-score">{golfer.scorecard?.round1?.scoreRound || '-'}</td>
                <td className="col round-score">{golfer.scorecard?.round2?.scoreRound || '-'}</td>
                <td className="col round-score">{golfer.scorecard?.round3?.scoreRound || '-'}</td>
                <td className="col round-score">{golfer.scorecard?.round4?.scoreRound || '-'}</td>
                <td className="col total-score">
                  {golfer.isCut ? 'CUT' : formatScore(golfer.score)}
                </td>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

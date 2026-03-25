import React, { useMemo } from 'react';
import type { ProcessedTeam } from '../../../../context/ScoreContext';
import type { Golfer } from '../../../../types/team';

interface Props {
  teams: ProcessedTeam[];
}

export const DashboardGolferLeaderboard: React.FC<Props> = ({ teams }) => {
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
    <div className="golfer-leaderboard-container">
      <table className="golfer-table">
        <thead>
          <tr>
            <th>POS</th>
            <th className="left-align">PLAYER</th>
            <th className="left-align">TEAM</th>
            <th>R1</th>
            <th>R2</th>
            <th>R3</th>
            <th>R4</th>
            <th>TOT</th>
          </tr>
        </thead>
        <tbody>
          {sortedGolfers.map((golfer, i) => (
            <tr key={`${golfer.id}-${i}`} className={golfer.isCut ? 'cut-row' : ''}>
              {/* <td>{golfer.position || '-'}</td> */}
              {/* ADD A POSITION */}
              <td>{'-'}</td>
              <td className="left-align fw-bold">{golfer.name}</td>
              <td className="left-align team-name">{golfer.teamOwner}</td>
              <td>{golfer.scorecard?.round1?.scoreRound || '-'}</td>
              <td>{golfer.scorecard?.round2?.scoreRound || '-'}</td>
              <td>{golfer.scorecard?.round3?.scoreRound || '-'}</td>
              <td>{golfer.scorecard?.round4?.scoreRound || '-'}</td>
              <td className="tot-score">{golfer.isCut ? 'CUT' : formatScore(golfer.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

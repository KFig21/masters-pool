import React from 'react';
import type { ProcessedTeam } from '../../../../context/ScoreContext';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner: string | null;
  onSelectTeam: (owner: string) => void;
}

export const DashboardTeamLeaderboard: React.FC<Props> = ({
  teams,
  selectedOwner,
  onSelectTeam,
}) => {
  const formatScore = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  return (
    <div className="mini-leaderboard">
      <div className="ml-header">
        <div className="col-pos">POS</div>
        <div className="col-team">TEAM</div>
        <th>R1</th>
        <th>R2</th>
        <th>R3</th>
        <th>R4</th>
        <th>TOT</th>
      </div>
      <div className="ml-body">
        {teams.map((team) => (
          <div
            key={team.owner}
            className={`ml-row ${selectedOwner === team.owner ? 'selected' : ''}`}
            onClick={() => onSelectTeam(team.owner)}
          >
            <div className="col-pos">{team.rank}</div>
            <div className="col-team">{team.owner}</div>
            <td>{team.stats.sumR1 || '-'}</td>
            <td>{team.stats.sumR2 || '-'}</td>
            <td>{team.stats.sumR3 || '-'}</td>
            <td>{team.stats.sumR4 || '-'}</td>
            <div className="col-score">{formatScore(team.stats.activeTotal)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

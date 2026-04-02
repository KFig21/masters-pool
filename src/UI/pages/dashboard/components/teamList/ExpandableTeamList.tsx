import React, { useMemo, useState } from 'react';
import { RoundTable } from '../../../team/components/scorecard/components/tables/RoundTable';
import type { ProcessedTeam } from '../../../../../context/ScoreContext';
import './styles.scss';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner: string | null;
  onToggleTeam: (owner: string) => void;
}

export const ExpandableTeamList: React.FC<Props> = ({ teams, selectedOwner, onToggleTeam }) => {
  const [sortedTeams, setSortedTeams] = useState<ProcessedTeam[]>([]);
  // sort by team alphabetically
  useMemo(() => {
    const teamsCopy = [...teams];
    // eslint-disable-next-line react-hooks/set-state-in-render
    setSortedTeams(teamsCopy.sort((a, b) => a.owner.localeCompare(b.owner)));
  }, [teams]);

  // const getTeamGolferStatus = (team: ProcessedTeam) => {
  //   const statuses = {
  //     cut: 0,
  //     done: 0,
  //     left: 0,
  //     active: 0,
  //     null: 0,
  //   };
  //   team.golfers.forEach((golfer) => {
  //     const status = golfer.isCut
  //       ? 'cut'
  //       : golfer.thru === 'F'
  //         ? 'done'
  //         : golfer.thru && golfer.thru.split(' ').includes('Thru')
  //           ? 'active'
  //           : golfer.thru
  //             ? 'left'
  //             : 'null';

  //     statuses[status] += 1;
  //   });

  //   return statuses;
  // };

  return (
    <div className="dashboard-panel">
      <div className="panel-upper team-details">
        <div className="panel-header">Team Details</div>
      </div>
      <div className="panel-lower">
        <div className="accordion-container">
          <div className="accordion-list">
            {sortedTeams.map((team) => (
              <div
                key={team.owner}
                className={`accordion-item ${selectedOwner === team.owner ? 'expanded' : ''}`}
              >
                <button className="accordion-header" onClick={() => onToggleTeam(team.owner)}>
                  <span className="owner-name">{team.owner}</span>
                  {/* <div className="team-stats">
                    <span className="stat">Score: {team.displayScore}</span>
                    <span className="stat">Active: {team.stats.activeGolfers}</span>
                  </div> */}
                  {selectedOwner != team.owner && <span className="accordion-icon">+</span>}
                </button>

                {selectedOwner === team.owner && (
                  <div className="accordion-content">
                    <TeamTablesWrapper team={team} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component to handle the toggle state between Round/Thru tables for the expanded team
const TeamTablesWrapper = ({ team }: { team: ProcessedTeam }) => {
  const sortedGolfers = useMemo(() => {
    return [...team.golfers].sort((a, b) => {
      // If both are cut or both active, sort by score
      if (a.isCut === b.isCut) {
        return (a.score || 0) - (b.score || 0);
      }
      // If a is cut, he goes after b (return 1)
      return a.isCut ? 1 : -1;
    });
  }, [team.golfers]);

  return <RoundTable golfers={sortedGolfers} stats={team.stats} />;
};

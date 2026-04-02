import React, { useMemo, useState } from 'react';
import { RoundTable } from '../../../team/components/scorecard/components/tables/RoundTable';
import { ThruTable } from '../../../team/components/scorecard/components/tables/ThruTable';
import type { ProcessedTeam } from '../../../../../context/ScoreContext';

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
  const [view, setView] = useState<'round' | 'cumulative'>('round');

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

  return (
    <div className="team-tables-wrapper">
      <div className="table-toggle">
        <button className={view === 'round' ? 'active' : ''} onClick={() => setView('round')}>
          Round View
        </button>
        <button
          className={view === 'cumulative' ? 'active' : ''}
          onClick={() => setView('cumulative')}
        >
          Cumulative View
        </button>
      </div>

      <div className="table-render-area">
        {/* Pass whatever props your actual components require here */}
        {view === 'round' ? (
          <RoundTable golfers={sortedGolfers} stats={team.stats} />
        ) : (
          <ThruTable golfers={sortedGolfers} stats={team.stats} />
        )}
      </div>
    </div>
  );
};

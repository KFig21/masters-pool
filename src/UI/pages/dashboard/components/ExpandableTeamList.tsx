import React, { useState } from 'react';
import { RoundTable } from '../../team/components/scorecard/components/tables/RoundTable';
import { ThruTable } from '../../team/components/scorecard/components/tables/ThruTable';
import type { ProcessedTeam } from '../../../../context/ScoreContext';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner: string | null;
  onToggleTeam: (owner: string) => void;
}

export const ExpandableTeamList: React.FC<Props> = ({ teams, selectedOwner, onToggleTeam }) => {
  return (
    <div className="accordion-container">
      <div className="accordion-list">
        {teams.map((team) => (
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
  );
};

// Sub-component to handle the toggle state between Round/Thru tables for the expanded team
const TeamTablesWrapper = ({ team }: { team: ProcessedTeam }) => {
  const [view, setView] = useState<'round' | 'cumulative'>('round');

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
          <RoundTable golfers={team.golfers} stats={team.stats} />
        ) : (
          <ThruTable golfers={team.golfers} stats={team.stats} />
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useState } from 'react';
import { RoundTable } from '../../../team/components/scorecard/components/tables/RoundTable';
import type { ProcessedTeam } from '../../../../../context/ScoreContext';
import './styles.scss';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner: string | null;
  onToggleTeam: (owner: string) => void;
}

export const ExpandableTeamList: React.FC<Props> = ({ teams, selectedOwner }) => {
  const [selectedTeam, setSelectedTeam] = useState<ProcessedTeam>(teams[0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTeam(teams.find((team) => team.owner === selectedOwner) || teams[0]);
  }, [teams, selectedOwner]);

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
      <div className="panel-upper ">
        <div className="panel-header">Team Details - {selectedOwner}</div>
      </div>
      <div className="panel-lower team-details">
        <div className="dashboard-team-scorecard-wrapper">
          <div className="dashboard-team-scorecard">
            <TeamTablesWrapper team={selectedTeam} />
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

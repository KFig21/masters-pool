/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../../../constants';
import { formatTournamentDates } from '../../utils/functions';

interface Props {
  teams: ProcessedTeam[];
}

export const DashboardGeneralInfo: React.FC<Props> = ({ teams }) => {
  const { currentEvent, currentYear, tournamentMetadata } = useScores();
  const eventConfig = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
  const yearConfig = eventConfig?.years[currentYear];

  // Calculate unique, active golfers across all teams
  const activeGolfersCount = useMemo(() => {
    let activeGolfers = 0;

    teams.forEach((team) => {
      activeGolfers += team.stats.activeGolfers;
    });

    return activeGolfers;
  }, [teams]);

  return (
    <div className="dashboard-panel">
      <div className="panel-lower">
        <div className="general-info-container">
          <div className="event-name-container">
            <div className="event-name">{eventConfig.name}</div>
          </div>
          <div className="info-row">
            <span className="info-label">Dates</span>
            <span className="info-value">
              {formatTournamentDates(yearConfig?.startDate, yearConfig?.endDate)}
            </span>
          </div>
          {tournamentMetadata && tournamentMetadata.course && (
            <div className="info-row">
              <span className="info-label">Course</span>
              <span className="info-value">{tournamentMetadata.course}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Par</span>
            <span className="info-value">{eventConfig.par}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Active Golfers</span>
            <span className="info-value">{activeGolfersCount}</span>
          </div>
          {tournamentMetadata && tournamentMetadata.currentRound && (
            <div className="info-row">
              <span className="info-label">
                {tournamentMetadata.currentRound < 3 ? `Projected Cut` : `Cut Line`}
              </span>
              <span className="info-value">{tournamentMetadata?.cutScore || '-'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

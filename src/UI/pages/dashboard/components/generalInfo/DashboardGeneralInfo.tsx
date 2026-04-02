/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../../../constants';

interface Props {
  teams: ProcessedTeam[];
}

export const DashboardGeneralInfo: React.FC<Props> = ({ teams }) => {
  const { currentEvent, currentYear } = useScores();
  const eventConfig = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];

  // Calculate unique, active golfers across all teams
  const activeGolfersCount = useMemo(() => {
    let activeGolfers = 0;

    teams.forEach((team) => {
      activeGolfers += team.stats.activeGolfers;
    });

    return activeGolfers;
  }, [teams]);

  // Safely format the date string (e.g., '2026-04-09' -> 'Apr 9')
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to prevent timezone shifting issues when parsing
    const date = new Date(`${dateString}T12:00:00Z`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

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
              {formatDate(eventConfig.years[currentYear].startDate)} -{' '}
              {formatDate(eventConfig.years[currentYear].endDate)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Course Par</span>
            <span className="info-value">{eventConfig.par}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Active Golfers</span>
            <span className="info-value active-count">{activeGolfersCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

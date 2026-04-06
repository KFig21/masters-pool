/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../../../constants';
import { formatTournamentDates } from '../../utils/functions';
import './styles.scss';

interface Props {
  teams: ProcessedTeam[];
}

export const DashboardGeneralInfo: React.FC<Props> = ({ teams }) => {
  const { currentEvent, currentYear, tournamentMetadata, isTournamentActive } = useScores();
  const eventConfig = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
  const yearConfig = eventConfig?.years[currentYear];

  const formatScore = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  // Calculate unique, active golfers across all teams
  const activeGolfersCount = useMemo(() => {
    let activeGolfers = 0;

    teams.forEach((team) => {
      activeGolfers += team.stats.activeGolfers;
    });

    return activeGolfers;
  }, [teams]);

  const currentRound = tournamentMetadata?.currentRound ?? 0;
  const cutScore = tournamentMetadata?.cutScore;
  const hasCutScore = typeof cutScore === 'number';

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
          {isTournamentActive && (
            <div className="info-row">
              <span className="info-label">Active Golfers</span>
              <span className="info-value">{activeGolfersCount}</span>
            </div>
          )}
          {hasCutScore && currentRound > 0 && (
            <div className="info-row">
              <span className="info-label">{currentRound < 3 ? `Projected Cut` : `Cut Line`}</span>
              <span className="info-value">{formatScore(cutScore)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import type { ProcessedTeam } from '../../../../context/ScoreContext';

interface Props {
  eventName: string;
  startDate: string;
  endDate: string;
  coursePar: number;
  teams: ProcessedTeam[];
}

export const DashboardGeneralInfo: React.FC<Props> = ({
  eventName,
  startDate,
  endDate,
  coursePar,
  teams,
}) => {
  // Calculate unique, active golfers across all teams
  const activeGolfersCount = useMemo(() => {
    const allGolfers = teams.flatMap((t) => t.golfers);

    // Remove duplicates in case multiple teams drafted the same golfer
    const uniqueGolfers = Array.from(new Map(allGolfers.map((g) => [g.id, g])).values());

    // Filter out CUT, WD (Withdrawn), and DQ (Disqualified)
    const active = uniqueGolfers.filter((g) => !g.isCut && g.status !== 'WD' && g.status !== 'DQ');

    return active.length;
  }, [teams]);

  // Safely format the date string (e.g., '2026-04-09' -> 'Apr 9')
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Append time to prevent timezone shifting issues when parsing
    const date = new Date(`${dateString}T12:00:00Z`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div className="general-info-container">
      <div className="info-row">
        <span className="info-label">Event</span>
        <span className="info-value">{eventName}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Dates</span>
        <span className="info-value">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
      </div>
      <div className="info-row">
        <span className="info-label">Course Par</span>
        <span className="info-value">{coursePar}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Active Players</span>
        <span className="info-value active-count">{activeGolfersCount}</span>
      </div>
    </div>
  );
};

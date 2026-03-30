import type { Golfer } from '../../../../../../../types/team';
import { useScores, type TeamStats } from '../../../../../../../context/ScoreContext';
import { useState } from 'react';
import { ROUNDS } from '../../../../../../../constants/golf';
import { getScoreClass, formatTeamValue, getTeamClass } from '../../utils/formatters';
import './styles.scss';
import { ThruBadge } from '../../../../../../components/thruBadge/ThruBadge';
import { EVENT_MATRIX } from '../../../../../../../constants';
import type { EventKey } from '../../../../../../../types/event';
import { AnimatedTeamCell } from './animatedTeamCell/AnimatedTeamCell';
// import { ScoreTestHarness } from './animatedTeamCell/ScoreTestHarness';

interface Props {
  golfers: Golfer[];
  stats: TeamStats;
}

export type ViewMode = 'relative' | 'strokes';

export const RoundTable = ({ golfers, stats }: Props) => {
  const [viewMode, setViewMode] = useState<ViewMode>('relative');
  const { isTournamentComplete, currentEvent, currentYear } = useScores();

  // Create the fingerprint to ensure keys change when the team changes,
  // preventing animations during navigation.
  const teamFingerprint = golfers.map((g) => g.id).join('-');

  // Formatting Helper specific to RoundTable's view modes
  const getCellData = (golfer: Golfer, round: number) => {
    const roundKey = `round${round}` as keyof typeof golfer.scorecard;
    const data = golfer.scorecard[roundKey];

    // Return the rawValue so AnimatedTeamCell can mathematically compare it
    if (!data) return { val: '-', class: '', isCounting: false, rawValue: null };

    const isCounting = !!data.isCountingScore;

    if (viewMode === 'strokes') {
      const strokeVal = data.total ? data.total : '-';
      const val = data.scoreRound;
      if (val === null || val === undefined)
        return { val: '-', class: '', isCounting, rawValue: null };

      const isUnder = val < 0;
      return { val: strokeVal, class: isUnder ? 'under' : 'over', isCounting, rawValue: val };
    } else {
      const val = data.scoreRound;

      if (val === null || val === undefined)
        return { val: '-', class: '', isCounting, rawValue: null };
      if (val === 0) return { val: 'E', class: 'even', isCounting, rawValue: val };

      const isUnder = val < 0;
      return {
        val: isUnder ? val : `+${val}`,
        class: isUnder ? 'under' : 'over',
        isCounting,
        rawValue: val,
      };
    }
  };

  return (
    <div className="scorecard-section-container">
      {/* Controls Header */}
      <div className="scorecard-controls">
        <div className="section-title">Round Scores</div>
        <div className="toggle-container">
          <span className={viewMode === 'relative' ? 'active' : ''}>To Par</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={viewMode === 'strokes'}
              onChange={() => setViewMode((prev) => (prev === 'relative' ? 'strokes' : 'relative'))}
            />
            <span className="slider round"></span>
          </label>
          <span className={viewMode === 'strokes' ? 'active' : ''}>Strokes</span>
        </div>
      </div>

      <div className="scorecard-table-container">
        {/* Table Header */}
        <div className="scorecard-table-row header">
          {/* Golfers Column */}
          <div className="scorecard-table-cell name-col"></div>
          {/* Round Columns */}
          {ROUNDS.map((round) => (
            <div key={round} className="scorecard-table-cell">
              R{round}
            </div>
          ))}
          {/* Total Column */}
          <div className="scorecard-table-cell">Score</div>
        </div>

        {/* Golfers */}
        {golfers.map((golfer, index) => {
          const eventKey = currentEvent as EventKey;
          const eventData = EVENT_MATRIX[eventKey];

          const CUT_LINE = eventData.years[currentYear].cutLine;
          // Top X get a thick border
          const isCutoff = index === CUT_LINE - 1;
          const isTopX = index < CUT_LINE;
          const rowClass = isTopX ? 'top-scorers' : 'not-top-scorers';

          return (
            <div
              key={golfer.id}
              className={`scorecard-table-row ${rowClass} ${isCutoff ? 'cutoff-border' : ''} ${golfer.isCut ? 'is-cut' : ''}`}
            >
              {/* Golfer Name */}
              <div className="scorecard-table-cell name-cell">
                {/* Desktop Name */}
                <span className="golfer-name desktop-label">{golfer.name}</span>

                {/* Mobile Name (First Initial + Last Name) */}
                <span className="golfer-name mobile-label">
                  {golfer.name.split(' ').length > 1
                    ? `${golfer.name.split(' ')[0][0]}. ${golfer.name.split(' ').slice(1).join(' ')}`
                    : golfer.name}
                </span>
                {/* Drop the badge right next to the name */}
                <ThruBadge
                  thru={golfer.thru}
                  isCut={golfer.isCut}
                  status={golfer.status}
                  isTournamentComplete={isTournamentComplete}
                />
              </div>

              {/* Round Columns */}
              {ROUNDS.map((round) => {
                const { val, class: colorClass, isCounting, rawValue } = getCellData(golfer, round);
                return (
                  <AnimatedTeamCell
                    key={`golfer-${golfer.id}-r${round}-${teamFingerprint}`}
                    value={rawValue}
                    className={`scorecard-table-cell stroke ${colorClass} ${isCounting ? 'counting-score' : ''}`}
                  >
                    {val}
                  </AnimatedTeamCell>
                );
              })}

              {/* Total Column */}
              <AnimatedTeamCell
                key={`golfer-${golfer.id}-total-${teamFingerprint}`}
                value={golfer.score}
                className={`scorecard-table-cell end-col ${getScoreClass(golfer.score, golfer.isCut)}`}
              >
                {golfer.status !== 'ACTIVE' ? golfer.status : golfer.displayScore}
              </AnimatedTeamCell>
            </div>
          );
        })}

        {/* Team Daily Row */}
        <div className="scorecard-table-row team-row">
          <div className="scorecard-table-cell name-col">TEAM DAILY</div>

          {/* ROUNDS */}
          {ROUNDS.map((r) => {
            const dailyKey = `dailyR${r}` as keyof TeamStats;
            const val = stats[dailyKey] as number | null;

            return (
              <AnimatedTeamCell
                key={`team-${teamFingerprint}-daily-${r}`}
                value={val}
                className={`scorecard-table-cell ${getTeamClass(val)}`}
              >
                {formatTeamValue(val)}
              </AnimatedTeamCell>
            );
          })}

          {/* TOTAL */}
          <AnimatedTeamCell
            key={`team-${teamFingerprint}-total`}
            value={stats.activeTotal}
            className={`scorecard-table-cell end-col ${getTeamClass(stats.activeTotal).toLowerCase()}`}
          >
            {formatTeamValue(stats.activeTotal)}
          </AnimatedTeamCell>
        </div>
      </div>
    </div>
  );
};

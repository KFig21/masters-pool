/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { useFavoriteTeam } from '../../../../../hooks/useFavoriteTeam';
import { ThruBadge } from '../../../../components/thruBadge/ThruBadge';
import type { Golfer } from '../../../../../types/team';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner?: string | null;
  onSelectTeam?: (owner: string) => void;
}

type SortKey = 'default' | 'thru' | 'r1' | 'r2' | 'r3' | 'r4';
type SortDirection = 'asc' | 'desc' | 'default';

export const DashboardGolferLeaderboard: React.FC<Props> = ({
  teams,
  selectedOwner,
  onSelectTeam,
}) => {
  const { isTournamentComplete, unassignedGolfers, tournamentMetadata } = useScores();
  const { favoriteTeam } = useFavoriteTeam();
  const [showUnassigned, setShowUnassigned] = useState(true);

  // Sorting State
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('default');

  const teamCount = teams.length;

  const handleHeaderClick = (key: SortKey) => {
    if (key === 'default') {
      setSortKey('default');
      setSortDirection('default');
      return;
    }

    if (sortKey === key) {
      // Cycle: Asc -> Desc -> Reset
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortKey('default');
        setSortDirection('default');
      } else setSortDirection('asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const baseRankedGolfers = useMemo(() => {
    const all = teams.flatMap((t) => t.golfers.map((g) => ({ ...g, teamOwner: t.owner })));
    if (showUnassigned) {
      all.push(...unassignedGolfers.map((g) => ({ ...g, teamOwner: '' })));
    }

    const getScore = (g: Golfer) => {
      if (g.isCut || g.status === 'WD' || g.status === 'DQ') return 999;
      return typeof g.score === 'number' ? g.score : 0;
    };

    // --- TIE-BREAKER LOGIC ---
    const getProgressValue = (g: Golfer) => {
      const t = (g.thru || '').trim().toUpperCase();

      // 1. Finished golfers at the very top of their score tier
      if (t === 'F' || t === 'F*') return 100;

      // 2. Golfers on the course (Thru 1 - 18)
      if (t.includes('THRU')) {
        return parseInt(t.replace(/\D/g, ''), 10) || 0;
      }

      // 3. Golfers who haven't started (Tee Times)
      // We return negative minutes so earlier times (-480 for 8am)
      // are "greater" than later times (-800 for 1:20pm)
      const timeMatch = t.match(/(\d+):(\d+)\s*(AM|PM)?/);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = parseInt(timeMatch[2], 10);
        const isPM = timeMatch[3] === 'PM';
        if (isPM && h < 12) h += 12;
        if (!isPM && h === 12) h = 0;
        return -(h * 60 + m);
      }

      return -2000; // DNP or unknown
    };

    const sorted = all.sort((a, b) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);

      // Primary Sort: Total Score
      if (scoreA !== scoreB) return scoreA - scoreB;

      // Secondary Sort (Tie-breaker): Progress
      // We use (b - a) because higher progress values should come first
      return getProgressValue(b) - getProgressValue(a);
    });

    return sorted.map((golfer, _, arr) => {
      const currentScore = getScore(golfer);
      const isBadStatus = currentScore === 999;
      // Use getScore for the rank lookup so ties still show the same POS (e.g. T12)
      const rank = arr.findIndex((g) => getScore(g) === currentScore) + 1;
      return { ...golfer, rank, isBadStatus };
    });
  }, [teams, unassignedGolfers, showUnassigned]);

  const displayGolfers = useMemo(() => {
    if (sortKey === 'default' || sortDirection === 'default') return baseRankedGolfers;

    const filtered = baseRankedGolfers.filter((g) => !g.isBadStatus);

    return [...filtered].sort((a, b) => {
      // --- THRU SORT LOGIC ---
      if (sortKey === 'thru') {
        const getThruData = (g: Golfer) => {
          const t = (g.thru || '').trim().toUpperCase();
          if (t === 'F' || t === 'F*') return { group: 2, val: 0 };

          const timeMatch = t.match(/(\d+):(\d+)\s*(AM|PM)?/);
          if (timeMatch) {
            let h = parseInt(timeMatch[1], 10);
            const m = parseInt(timeMatch[2], 10);
            const isPM = timeMatch[3] === 'PM';
            if (isPM && h < 12) h += 12;
            if (!isPM && h === 12) h = 0;
            return { group: 3, val: h * 60 + m };
          }

          const hole = parseInt(t.replace(/\D/g, ''), 10) || 0;
          return { group: 1, val: hole };
        };

        const aD = getThruData(a);
        const bD = getThruData(b);

        if (aD.group !== bD.group) return aD.group - bD.group;
        if (aD.group === 3) return aD.val - bD.val;
        return sortDirection === 'asc' ? aD.val - bD.val : bD.val - aD.val;
      }

      // --- ROUND SORT LOGIC ---
      // 1. Explicitly map our sort keys to the actual keys on the Scorecard object
      const roundMap = {
        r1: 'round1',
        r2: 'round2',
        r3: 'round3',
        r4: 'round4',
      } as const;

      // 2. Only attempt round sorting if the sortKey exists in our map
      if (sortKey in roundMap) {
        const scorecardKey = roundMap[sortKey as keyof typeof roundMap];

        // 3. Use the typed key to access the scorecard safely
        const valA =
          a.scorecard?.[scorecardKey]?.scoreRound ?? (sortDirection === 'asc' ? 999 : -999);
        const valB =
          b.scorecard?.[scorecardKey]?.scoreRound ?? (sortDirection === 'asc' ? 999 : -999);

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });
  }, [baseRankedGolfers, sortKey, sortDirection]);

  const formatScore = (val: any) => {
    if (val === null || val === undefined || val === Infinity || val === 999 || val === -999)
      return '-';
    if (typeof val === 'string') return val;
    return val === 0 ? 'E' : val > 0 ? `+${val}` : val;
  };

  const getScoreClass = (val: any) => {
    if (val === 'CUT' || val === 'DQ' || val === 'WD') return 'cut';
    if (typeof val !== 'number' || Math.abs(val) > 100) return '';
    return val < 0 ? 'under-par' : val > 0 ? 'over-par' : 'even-par';
  };

  // Projected Cut Line
  const isDay2 = tournamentMetadata?.currentRound === 2;
  const projectedCutValue = tournamentMetadata?.cutScore ?? 999;

  // Find the index of the last golfer who makes the projected cut
  let projectedCutIndex = -1;
  if (isDay2 && sortKey === 'default') {
    for (let j = 0; j < displayGolfers.length; j++) {
      const g = displayGolfers[j];
      if (!g.isBadStatus && (typeof g.score === 'number' ? g.score : 0) <= projectedCutValue) {
        projectedCutIndex = j;
      } else break;
    }
  }

  const getSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'asc' ? ' ↑' : sortDirection === 'desc' ? ' ↓' : '';
  };

  return (
    <div className="dashboard-panel golfer-panel">
      <div className="panel-upper">
        <div className="panel-header">Individual Leaderboard</div>
        <div className="leaderboard-header golfer-table">
          <div
            className="col header pos"
            onClick={() => handleHeaderClick('default')}
            style={{ cursor: 'pointer' }}
          >
            POS
          </div>
          <div className="col header golfer">
            <span className="golfer-name" onClick={() => handleHeaderClick('thru')}>
              GOLFER
              <span className="sort-indicator">{getSortIndicator('thru')}</span>
            </span>
            <div className="toggle-container" style={{ marginLeft: '10px' }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!showUnassigned}
                  onChange={() => setShowUnassigned(!showUnassigned)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          <div className="col header team">TEAM</div>
          {['r1', 'r2', 'r3', 'r4'].map((r) => (
            <div
              key={r}
              className="col header round-score"
              onClick={() => handleHeaderClick(r as SortKey)}
              style={{ cursor: 'pointer' }}
            >
              {r.toUpperCase()}
              {getSortIndicator(r as SortKey)}
            </div>
          ))}
          <div
            className="col header total-score"
            onClick={() => handleHeaderClick('default')}
            style={{ cursor: 'pointer' }}
          >
            TOT
          </div>
        </div>
      </div>

      <div className="panel-lower">
        <div className="mini-leaderboard">
          <div className="ml-body">
            {displayGolfers.map((golfer, i) => {
              const scores = [
                golfer.scorecard?.round1?.scoreRound,
                golfer.scorecard?.round2?.scoreRound,
                golfer.scorecard?.round3?.scoreRound,
                golfer.scorecard?.round4?.scoreRound,
              ];
              const totalScore = golfer.isCut ? golfer.status : golfer.score;
              const isFirstCutRow =
                sortKey === 'default' &&
                golfer.isBadStatus &&
                (i === 0 || !displayGolfers[i - 1].isBadStatus);

              return (
                <React.Fragment key={golfer.id}>
                  <motion.div
                    layout="position"
                    layoutDependency={displayGolfers}
                    transition={{ type: 'spring', stiffness: 130, damping: 30 }}
                    onClick={() => onSelectTeam?.(golfer.teamOwner)}
                    className={`leaderboard-row golfer-table ${golfer.isBadStatus ? 'cut-row' : ''} ${isFirstCutRow ? 'first-cut-row' : ''} ${favoriteTeam === golfer.teamOwner ? 'favorite' : ''} ${selectedOwner === golfer.teamOwner ? 'selected' : ''} ${teamCount > 8 && 'compact-9'}`}
                  >
                    <div className="col pos">
                      {(sortKey === 'default' &&
                        i > 0 &&
                        golfer.rank === displayGolfers[i - 1].rank) ||
                      golfer.isBadStatus
                        ? ''
                        : golfer.rank}
                    </div>
                    <div className="col golfer">
                      <span className="golfer-name">{golfer.name}</span>
                      <div className="badge-container">
                        <ThruBadge
                          thru={golfer.thru}
                          isCut={golfer.isCut}
                          status={golfer.status}
                          isTournamentComplete={isTournamentComplete}
                        />
                      </div>
                    </div>
                    <div className="col team">{golfer.teamOwner || '-'}</div>
                    {scores.map((s, idx) => (
                      <div key={idx} className={`col round-score ${getScoreClass(s)}`}>
                        {formatScore(s)}
                      </div>
                    ))}
                    <div className={`col total-score ${getScoreClass(totalScore)}`}>
                      {formatScore(totalScore)}
                    </div>
                  </motion.div>

                  {sortKey === 'default' && isDay2 && projectedCutIndex === i && (
                    <motion.div layout="position" className="projected-cut-line">
                      Projected Cut ({formatScore(projectedCutValue)})
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

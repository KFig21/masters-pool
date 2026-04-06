import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import type { Golfer } from '../../../../../types/team';
import { useFavoriteTeam } from '../../../../../hooks/useFavoriteTeam';
import { ThruBadge } from '../../../../components/thruBadge/ThruBadge';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner?: string | null;
  onSelectTeam?: (owner: string) => void;
}

export const DashboardGolferLeaderboard: React.FC<Props> = ({
  teams,
  selectedOwner,
  onSelectTeam,
}) => {
  const { isTournamentComplete, unassignedGolfers } = useScores();
  const { favoriteTeam } = useFavoriteTeam();
  const [showUnassigned, setShowUnassigned] = useState(true);

  const sortedGolfers = useMemo(() => {
    // 1. Flatten all golfers and attach their team owner
    const all = teams.flatMap((t) => t.golfers.map((g) => ({ ...g, teamOwner: t.owner })));

    if (showUnassigned) {
      all.push(...unassignedGolfers.map((g) => ({ ...g, teamOwner: '' })));
    }

    // Helper to get score for sorting and ranking
    const getScore = (g: Golfer) => {
      if (g.isCut || g.status === 'WD' || g.status === 'DQ') return 999;
      return typeof g.score === 'number' ? g.score : 0;
    };

    // 2. Sort by total score (handle cuts/WDs by pushing to bottom)
    const sorted = all.sort((a, b) => getScore(a) - getScore(b));

    // 3. Calculate rank and ties
    return sorted.map((golfer, _, arr) => {
      const currentScore = getScore(golfer);
      const isBadStatus = currentScore === 999;

      // Rank is the first index where this score appears + 1
      const rank = arr.findIndex((g) => getScore(g) === currentScore) + 1;

      // It's a tie if more than one person has this exact score (and they aren't cut)
      const isTied = !isBadStatus && arr.filter((g) => getScore(g) === currentScore).length > 1;

      return { ...golfer, rank, isTied, isBadStatus };
    });
  }, [teams, unassignedGolfers, showUnassigned]);

  const formatScore = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === Infinity) return '-';
    if (typeof val === 'string') return val;
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  const getScoreClass = (val: number | string | null | undefined) => {
    if (val === 'CUT' || val === 'DQ' || val === 'WD' || val === 'DNP') return 'cut';
    if (typeof val !== 'number' || val === Infinity) return '';
    if (val < 0) return 'under-par';
    if (val > 0) return 'over-par';
    return 'even-par';
  };

  return (
    <div className="dashboard-panel golfer-panel">
      <div className="panel-upper">
        <div className="panel-header">Individual Leaderboard</div>
        <div className="leaderboard-header golfer-table">
          <div className="col header pos">POS</div>
          <div className="col header golfer">
            GOLFER
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
          <div className="col header round-score">R1</div>
          <div className="col header round-score">R2</div>
          <div className="col header round-score">R3</div>
          <div className="col header round-score">R4</div>
          <div className="col header total-score">TOT</div>
        </div>
      </div>
      <div className="panel-lower">
        <div className="mini-leaderboard">
          <div className="ml-body">
            {sortedGolfers.map((golfer, i) => {
              const r1Score = golfer.scorecard?.round1?.scoreRound;
              const r2Score = golfer.scorecard?.round2?.scoreRound;
              const r3Score = golfer.scorecard?.round3?.scoreRound;
              const r4Score = golfer.scorecard?.round4?.scoreRound;
              const totalScore = golfer.isCut ? golfer.status : golfer.score;

              // Find if this is the start of the cut line
              const isCutRow = golfer.isBadStatus;
              const isFirstCutRow = isCutRow && (i === 0 || !sortedGolfers[i - 1].isBadStatus);

              return (
                <motion.div
                  layout="position"
                  layoutDependency={sortedGolfers}
                  transition={{ type: 'spring', stiffness: 130, damping: 30 }}
                  key={golfer.id}
                  onClick={() => onSelectTeam?.(golfer.teamOwner)}
                  className={`leaderboard-row golfer-table ${isCutRow ? 'cut-row' : ''} ${isFirstCutRow ? 'first-cut-row' : ''} ${favoriteTeam === golfer.teamOwner ? 'favorite' : ''} ${selectedOwner === golfer.teamOwner ? 'selected' : ''}`}
                >
                  <div className="col pos">
                    {i > 0 && golfer.rank === sortedGolfers[i - 1].rank
                      ? ''
                      : golfer.isBadStatus
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
                  <div className="col team">{golfer.teamOwner ? golfer.teamOwner : '-'}</div>

                  <div className={`col round-score ${getScoreClass(r1Score)}`}>
                    {formatScore(r1Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r2Score)}`}>
                    {formatScore(r2Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r3Score)}`}>
                    {formatScore(r3Score)}
                  </div>
                  <div className={`col round-score ${getScoreClass(r4Score)}`}>
                    {formatScore(r4Score)}
                  </div>
                  <div className={`col total-score ${getScoreClass(totalScore)}`}>
                    {formatScore(totalScore)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

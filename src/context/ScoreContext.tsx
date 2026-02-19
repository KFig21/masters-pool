/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useMemo } from 'react';
import compiledTeams from '../data/team_data.json';
import type { Team, Golfer } from '../data/teams';

export interface TeamStats {
  sumR1: number;
  sumR2: number;
  sumR3: number;
  sumR4: number;
  activeTotal: number | string;
  isTeamCut: boolean;
}

export interface ProcessedTeam extends Omit<Team, 'golfers'> {
  golfers: Golfer[];
  stats: TeamStats;
  rank: number;
}

interface ScoreContextType {
  teams: ProcessedTeam[];
  getTeamByOwner: (ownerName: string) => ProcessedTeam | undefined;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  const processedData = useMemo(() => {
    /**
     * Calculates the best 4 cumulative scores for a specific round.
     * Note: We ignore the global isCut status here so that historic
     * R1/R2 scores remain visible even if the team eventually fails the cut.
     */
    const getBest4Sum = (
      golfers: Golfer[],
      roundKey: 'round1' | 'round2' | 'round3' | 'round4',
    ): number => {
      const scores = golfers
        .map((g) => g.scorecard?.[roundKey]?.thruScore)
        .filter((val): val is number => typeof val === 'number') // Keep only valid numbers
        .sort((a, b) => a - b);

      // If we don't have at least 4 golfers with data for this round, return Infinity
      if (scores.length < 4) return Infinity;

      // Sum the best 4
      return scores.slice(0, 4).reduce((acc, curr) => acc + curr, 0);
    };

    // --- STEP 1: Process Raw Data ---
    const teamsWithStats = (compiledTeams as any[]).map((team) => {
      const golfers = team.golfers as Golfer[];

      const sumR1 = getBest4Sum(golfers, 'round1');
      const sumR2 = getBest4Sum(golfers, 'round2');
      const sumR3 = getBest4Sum(golfers, 'round3');
      const sumR4 = getBest4Sum(golfers, 'round4');

      // Team-level cut logic: Do they have 4 active (non-cut) golfers?
      const activeGolfersCount = golfers.filter((g) => !g.isCut).length;
      const isTeamCut = activeGolfersCount < 4;

      let activeTotal: number | string = 0;

      if (isTeamCut) {
        activeTotal = 'CUT';
      } else {
        // Find the most recent valid round sum
        if (sumR4 !== Infinity) activeTotal = sumR4;
        else if (sumR3 !== Infinity) activeTotal = sumR3;
        else if (sumR2 !== Infinity) activeTotal = sumR2;
        else if (sumR1 !== Infinity) activeTotal = sumR1;
        else activeTotal = 0;
      }

      return {
        ...team,
        golfers,
        stats: { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut },
      };
    });

    // --- STEP 2: Sort Teams ---
    const sorted = [...teamsWithStats].sort((a, b) => {
      const scoreA = a.stats.activeTotal;
      const scoreB = b.stats.activeTotal;
      const isBadStatus = (val: any) => val === 'CUT' || val === 'WD' || val === 'DQ';

      if (isBadStatus(scoreA) && isBadStatus(scoreB)) return 0;
      if (isBadStatus(scoreA)) return 1;
      if (isBadStatus(scoreB)) return -1;
      return (scoreA as number) - (scoreB as number);
    });

    // --- STEP 3: Assign Ranks ---
    return sorted.map((team, index) => ({
      ...team,
      rank: index + 1,
    })) as ProcessedTeam[];
  }, []);

  const getTeamByOwner = (ownerName: string) => {
    return processedData.find((t) => t.owner.toLowerCase() === ownerName.toLowerCase());
  };

  return (
    <ScoreContext.Provider value={{ teams: processedData, getTeamByOwner }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScores = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScores must be used within ScoreProvider');
  return context;
};

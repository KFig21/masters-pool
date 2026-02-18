import React, { createContext, useContext, useMemo } from 'react';
import compiledTeams from '../data/team_data.json';
import type { Team } from '../data/teams';

// Define the shape of our calculated stats
export interface TeamStats {
  sumR1: number;
  sumR2: number;
  sumR3: number;
  sumR4: number;
  activeTotal: number | string;
  isTeamCut: boolean;
}

// Extend the base Team interface to include our calculated stats and rank
export interface ProcessedTeam extends Team {
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
    // --- HELPER: Calculate Best 4 Sum ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getBest4Sum = (golfers: any[], roundKey: string): number => {
      const scores = golfers.map((g) => {
        const val = g.scorecard?.[roundKey]?.thruScore;
        return typeof val === 'number' ? val : Infinity;
      });
      scores.sort((a, b) => a - b);
      const best4 = scores.slice(0, 4);
      if (best4.some((s) => s === Infinity)) return Infinity;
      return best4.reduce((acc, curr) => acc + curr, 0);
    };

    // --- STEP 1: Process Raw Data ---
    const teamsWithStats = compiledTeams.map((team) => {
      const sumR1 = getBest4Sum(team.golfers, 'round1');
      const sumR2 = getBest4Sum(team.golfers, 'round2');
      const sumR3 = getBest4Sum(team.golfers, 'round3');
      const sumR4 = getBest4Sum(team.golfers, 'round4');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const activeGolfersCount = team.golfers.filter((g: any) => !g.isCut).length;
      const isTeamCut = activeGolfersCount < 4;

      let activeTotal: number | string = 0;

      if (isTeamCut) {
        activeTotal = 'CUT';
      } else {
        if (sumR4 !== Infinity) activeTotal = sumR4;
        else if (sumR3 !== Infinity) activeTotal = sumR3;
        else if (sumR2 !== Infinity) activeTotal = sumR2;
        else if (sumR1 !== Infinity) activeTotal = sumR1;
        else activeTotal = 999; // Pre-tourney default
      }

      return {
        ...team,
        stats: { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut },
      };
    });

    // --- STEP 2: Sort Teams ---
    const sorted = [...teamsWithStats].sort((a, b) => {
      const scoreA = a.stats.activeTotal;
      const scoreB = b.stats.activeTotal;

      const isBadStatus = (val: number | string) => val === 'CUT' || val === 'WD' || val === 'DQ';

      if (isBadStatus(scoreA) && isBadStatus(scoreB)) return 0;
      if (isBadStatus(scoreA)) return 1;
      if (isBadStatus(scoreB)) return -1;

      return (scoreA as number) - (scoreB as number);
    });

    // --- STEP 3: Assign Ranks ---
    // We map again to inject the "Rank" property permanently
    return sorted.map((team, index) => ({
      ...team,
      rank: index + 1,
    })) as ProcessedTeam[];
  }, []); // Empty dependency array = runs only once on mount

  // Helper to find a team efficiently
  const getTeamByOwner = (ownerName: string) => {
    return processedData.find((t) => t.owner === ownerName);
  };

  return (
    <ScoreContext.Provider value={{ teams: processedData, getTeamByOwner }}>
      {children}
    </ScoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useScores = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScores must be used within ScoreProvider');
  return context;
};

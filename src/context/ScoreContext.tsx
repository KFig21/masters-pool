/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CURRENT_EVENT, CURRENT_YEAR } from '../constants';
import type { Team, Golfer } from '../types/team';

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

// 1. UPDATE THE TYPE DEFINITION
interface ScoreContextType {
  teams: ProcessedTeam[];
  getTeamByOwner: (ownerName: string) => ProcessedTeam | undefined;
  currentEvent: string;
  currentYear: number;
  setCurrentEvent: (event: string) => void;
  setCurrentYear: (year: number) => void;
  isLoading: boolean;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  // 2. ADD GLOBAL STATE FOR EVENT AND YEAR
  const [currentEvent, setCurrentEvent] = useState<string>(CURRENT_EVENT);
  const [currentYear, setCurrentYear] = useState<number>(CURRENT_YEAR);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. FETCH DATA DYNAMICALLY BASED ON STATE
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchScores = async () => {
      try {
        // Dynamically build the URL based on context state
        const response = await fetch(`/data/events/${currentEvent}/${currentYear}/latest.json`);

        if (!response.ok) {
          throw new Error(`Data not found for ${currentEvent} ${currentYear}`);
        }

        const data = await response.json();
        if (isMounted) setRawTeams(data);
      } catch (error) {
        console.error('Failed to fetch latest scores', error);
        if (isMounted) setRawTeams([]); // Fallback to an empty array so the app doesn't crash
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchScores();

    // Poll for new data every 5 minutes
    const intervalId = setInterval(fetchScores, 5 * 60 * 1000);

    // Cleanup function to prevent state updates if the component unmounts
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentEvent, currentYear]); // Re-run this effect whenever event or year changes!

  const processedData = useMemo(() => {
    // If we haven't fetched data yet, return an empty array
    if (!rawTeams || rawTeams.length === 0) return [];

    const getBest4Sum = (
      golfers: Golfer[],
      roundKey: 'round1' | 'round2' | 'round3' | 'round4',
    ): number => {
      const scores = golfers
        .map((g) => g.scorecard?.[roundKey]?.thruScore)
        .filter((val): val is number => typeof val === 'number')
        .sort((a, b) => a - b);

      if (scores.length < 4) return Infinity;
      return scores.slice(0, 4).reduce((acc, curr) => acc + curr, 0);
    };

    // --- STEP 1: Process Raw Data ---
    // Make sure we iterate over rawTeams instead of the hardcoded compiledTeams
    const teamsWithStats = rawTeams.map((team) => {
      const golfers = team.golfers as Golfer[];

      const sumR1 = getBest4Sum(golfers, 'round1');
      const sumR2 = getBest4Sum(golfers, 'round2');
      const sumR3 = getBest4Sum(golfers, 'round3');
      const sumR4 = getBest4Sum(golfers, 'round4');

      const activeGolfersCount = golfers.filter((g) => !g.isCut).length;
      const isTeamCut = activeGolfersCount < 4;

      let activeTotal: number | string = 0;

      if (isTeamCut) {
        activeTotal = 'CUT';
      } else {
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
  }, [rawTeams]); // Recalculate whenever rawTeams updates

  const getTeamByOwner = (ownerName: string) => {
    return processedData.find((t) => t.owner.toLowerCase() === ownerName.toLowerCase());
  };

  return (
    <ScoreContext.Provider
      value={{
        teams: processedData,
        getTeamByOwner,
        currentEvent,
        currentYear,
        setCurrentEvent,
        setCurrentYear,
        isLoading,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScores = () => {
  const context = useContext(ScoreContext);
  if (!context) throw new Error('useScores must be used within ScoreProvider');
  return context;
};

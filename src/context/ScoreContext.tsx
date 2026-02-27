/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from '../constants';
import type { Team, Golfer, EventType } from '../types/team';

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

// 1. TYPE DEFINITION
interface ScoreContextType {
  teams: ProcessedTeam[];
  lastUpdated: string | null;
  getTeamByOwner: (ownerName: string) => ProcessedTeam | undefined;
  currentEvent: EventType;
  currentYear: number;
  setCurrentEvent: (event: EventType) => void;
  setCurrentYear: (year: number) => void;
  isLoading: boolean;
  isTournamentComplete: boolean;
  isTournamentActive: boolean;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentEvent, setCurrentEvent] = useState<EventType>(CURRENT_EVENT as EventType);
  const [currentYear, setCurrentYear] = useState<number>(CURRENT_YEAR);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null); // Added state
  const [isLoading, setIsLoading] = useState(true);

  const isTournamentActive = useMemo(() => {
    const eventData = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
    const yearConfig = eventData?.years[currentYear];

    if (!yearConfig?.startDate || !yearConfig?.endDate) return false;

    const now = new Date();
    const start = new Date(`${yearConfig.startDate}T00:00:00`);
    const end = new Date(`${yearConfig.endDate}T23:59:59`);

    return now >= start && now <= end;
  }, [currentEvent, currentYear]);

  // 3. FETCH DATA DYNAMICALLY
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchScores = async () => {
      try {
        const response = await fetch(`/api/scores/${currentEvent}/${currentYear}`);

        if (!response.ok) {
          throw new Error(`Data not found`);
        }

        const result = await response.json();

        if (isMounted) {
          // Destructure the new object format { teams: [...], lastUpdated: "..." }
          setRawTeams(result.teams || []);
          setLastUpdated(result.lastUpdated || null);
          console.log('Polled for new data at:', result.lastUpdated);
        }
      } catch (error) {
        console.error('Failed to fetch latest scores', error);
        if (isMounted) setRawTeams([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchScores();

    // Poll for new data every 1 minute
    // SMART POLLING: 30s if active, 5 minutes if not
    const pollInterval = isTournamentActive ? 30 * 1000 : 5 * 60 * 1000;
    const intervalId = setInterval(fetchScores, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentEvent, currentYear]);

  // Combined Memo for Processing Data and Completion State
  const { teams, isTournamentComplete } = useMemo(() => {
    if (!rawTeams || rawTeams.length === 0) {
      return { teams: [], isTournamentComplete: false };
    }

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

    const allGolfers = rawTeams.flatMap((t) => t.golfers as Golfer[]);
    const activeGolfers = allGolfers.filter((g) => !g.isCut);
    const hasR4Started = activeGolfers.some((g) => g.scorecard?.round4?.thruScore !== null);
    const allActiveFinished = activeGolfers.every((g) => g.thru === 'F');
    const isComplete = hasR4Started && allActiveFinished;

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

    const sorted = [...teamsWithStats].sort((a, b) => {
      const scoreA = a.stats.activeTotal;
      const scoreB = b.stats.activeTotal;
      const isBadStatus = (val: any) => val === 'CUT' || val === 'WD' || val === 'DQ';

      if (isBadStatus(scoreA) && isBadStatus(scoreB)) return 0;
      if (isBadStatus(scoreA)) return 1;
      if (isBadStatus(scoreB)) return -1;
      return (scoreA as number) - (scoreB as number);
    });

    const processedTeams = sorted.map((team) => {
      // Find the first index where this specific score appears in the sorted array
      // This is the "Golf Rank"
      const golfRank = sorted.findIndex((t) => t.stats.activeTotal === team.stats.activeTotal) + 1;

      return {
        ...team,
        rank: golfRank,
      };
    }) as ProcessedTeam[];

    return { teams: processedTeams, isTournamentComplete: isComplete };
  }, [rawTeams]);

  const getTeamByOwner = (ownerName: string) => {
    return teams.find((t) => t.owner.toLowerCase() === ownerName.toLowerCase());
  };

  return (
    <ScoreContext.Provider
      value={{
        teams,
        lastUpdated,
        getTeamByOwner,
        currentEvent,
        currentYear,
        setCurrentEvent,
        setCurrentYear,
        isLoading,
        isTournamentComplete,
        isTournamentActive,
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

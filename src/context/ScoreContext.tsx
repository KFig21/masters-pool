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
  dailyR1: number | null;
  dailyR2: number | null;
  dailyR3: number | null;
  dailyR4: number | null;
  activeTotal: number | string;
  isTeamCut: boolean;
  activeGolfers: number;
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
  nextUpdate: string | null;
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);
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
  // const isTournamentActive = true;

  // 3. FETCH DATA DYNAMICALLY
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchScores = async () => {
      try {
        const response = await fetch(`/api/scores/${currentEvent}/${currentYear}`);

        if (!response.ok) {
          throw new Error(`Data not found`);
        }

        const result = await response.json();

        if (isMounted) {
          setRawTeams(result.teams || []);
          setLastUpdated(result.lastUpdated || null);
          setNextUpdate(result.nextUpdate || null);
          console.log('Polled for new data at:', result.lastUpdated);

          // Schedule the next fetch based on the server's exact timestamp
          scheduleNextFetch(result.nextUpdate);
        }
      } catch (error) {
        console.error('Failed to fetch latest scores', error);
        if (isMounted) {
          setRawTeams([]);
          scheduleNextFetch(null); // Fallback if error
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const scheduleNextFetch = (targetTimeStr: string | null) => {
      if (!isMounted) return;
      clearTimeout(timeoutId);

      // Default fallback intervals
      let delayMs = isTournamentActive ? 30 * 1000 : 5 * 60 * 1000;

      if (targetTimeStr && isTournamentActive) {
        const now = Date.now();
        const targetTime = new Date(targetTimeStr).getTime();
        const msUntilUpdate = targetTime - now;

        if (msUntilUpdate > 0) {
          // Wait until the target time PLUS 5 seconds for the backend to finish saving to the DB
          delayMs = msUntilUpdate + 5000;
        } else {
          // If we are already past the target time (desync), try again in 10 seconds
          delayMs = 10000;
        }

        // Clamp the delay so it never goes completely crazy (min 5s, max 5 mins)
        delayMs = Math.min(Math.max(delayMs, 5000), 5 * 60 * 1000);
      }

      timeoutId = setTimeout(fetchScores, delayMs);
    };

    // Initial fetch
    setIsLoading(true);
    fetchScores();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentEvent, currentYear, isTournamentActive]);

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

      // Calculate the daily deltas
      const dailyR1 = sumR1 === Infinity ? null : sumR1;
      const dailyR2 = sumR2 === Infinity || sumR1 === Infinity ? null : sumR2 - sumR1;
      const dailyR3 = sumR3 === Infinity || sumR2 === Infinity ? null : sumR3 - sumR2;
      const dailyR4 = sumR4 === Infinity || sumR3 === Infinity ? null : sumR4 - sumR3;

      // 1. Check who survived the cut to determine if the team is still alive
      const survivingGolfersCount = golfers.filter((g) => !g.isCut).length;
      const isTeamCut = survivingGolfersCount < 4;

      // 2. Count who is actively on the course right now (has started, but hasn't finished)
      const activeGolfers = golfers.filter((g) => {
        if (g.isCut) return false;

        // Assuming your API returns 'F' for finished, and null/'' for un-started
        if (!g.thru || g.thru === 'F') return false;

        return true;
      }).length;

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
        stats: {
          sumR1,
          sumR2,
          sumR3,
          sumR4,
          dailyR1,
          dailyR2,
          dailyR3,
          dailyR4,
          activeTotal,
          activeGolfers,
          isTeamCut,
        },
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
        nextUpdate,
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

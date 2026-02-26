import type { eventsEnum } from '../constants/enums';

export interface Round {
  total: number | null;
  scoreRound: number | null;
  thruScore: number | null;
  isCountingScore?: boolean;
}

export interface Scorecard {
  round1: Round;
  round2: Round;
  round3: Round;
  round4: Round;
}

export interface Golfer {
  id: string;
  name: string;
  score?: number;
  displayScore?: string;
  thru?: string;
  status?: 'ACTIVE' | 'CUT' | 'DQ' | 'WD';
  isCut?: boolean;
  scorecard: Scorecard;
}

// A helper type for the initial data structure in the TEAMS array
export interface GolferReference {
  name: string;
  id: string;
}

export interface Team {
  owner: string;
  golfers: GolferReference[];
  totalScore?: number;
  displayScore?: string;
  golferData?: Golfer[];
  isDisqualified?: boolean; // TODO: Find a way to make use of this
}

export type EventType = (typeof eventsEnum)[keyof typeof eventsEnum];

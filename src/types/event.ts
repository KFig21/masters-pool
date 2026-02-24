import type { eventsEnum } from '../constants/enums';
import type { Team } from './team';

export type EventKey = (typeof eventsEnum)[keyof typeof eventsEnum];

export type HoleNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18;

export type ParByHole = Record<HoleNumber, number>;

export type EventYearInfo = {
  id: number;
  teams: Team[] | null;
  rosterSize: number;
  cutLine: number;
};

export type EventYears = Record<number, EventYearInfo>;

export type EventConfig = {
  id: EventKey;
  name: string;
  title: string;
  par: number;
  parByHole: ParByHole;
  years: EventYears;
  Rounds: readonly [1, 2, 3, 4];
};

export type EventMatrix = Record<EventKey, EventConfig>;

import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_houston_2026 } from './teams/2026';

export const houstonEventData: EventConfig = {
  id: eventsEnum.HOUSTON,
  name: 'The Houston Open',
  title: 'Houston Open',
  par: 70,
  parByHole: {
    1: 4,
    2: 3,
    3: 5,
    4: 4,
    5: 4,
    6: 4,
    7: 3,
    8: 5,
    9: 3,
    10: 4,
    11: 3,
    12: 4,
    13: 4,
    14: 4,
    15: 3,
    16: 5,
    17: 4,
    18: 4,
  },
  years: {
    2026: {
      id: 401811939,
      teams: teams_houston_2026,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2026-03-26',
      endDate: '2026-03-29',
    },
  },
  Rounds: [1, 2, 3, 4],
};

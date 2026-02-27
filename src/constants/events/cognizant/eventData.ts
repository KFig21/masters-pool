import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_cognizant_2026 } from './teams/2026';

export const cognizantEventData: EventConfig = {
  id: eventsEnum.COGNIZANT,
  name: 'Cognizant Classic',
  title: 'Cognizant',
  par: 71,
  parByHole: {
    1: 4,
    2: 4,
    3: 5,
    4: 4,
    5: 3,
    6: 4,
    7: 3,
    8: 4,
    9: 4,
    10: 5,
    11: 4,
    12: 4,
    13: 4,
    14: 4,
    15: 3,
    16: 4,
    17: 3,
    18: 5,
  },
  years: {
    2026: {
      id: 401811934,
      teams: teams_cognizant_2026,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2026-02-26',
      endDate: '2026-03-01',
    },
  },
  Rounds: [1, 2, 3, 4],
};

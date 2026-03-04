import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_arnold_palmer_2026 } from './teams/2026';

export const arnoldPalmerEventData: EventConfig = {
  id: eventsEnum.ARNOLD_PALMER,
  name: 'Arnold Palmer Invitational',
  title: 'Arnold Palmer',
  par: 72,
  parByHole: {
    1: 4,
    2: 3,
    3: 4,
    4: 5,
    5: 4,
    6: 5,
    7: 3,
    8: 4,
    9: 4,
    10: 4,
    11: 4,
    12: 5,
    13: 4,
    14: 3,
    15: 4,
    16: 5,
    17: 3,
    18: 4,
  },
  years: {
    2026: {
      id: 401811935,
      teams: teams_arnold_palmer_2026,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2026-03-05',
      endDate: '2026-03-08',
    },
  },
  Rounds: [1, 2, 3, 4],
};

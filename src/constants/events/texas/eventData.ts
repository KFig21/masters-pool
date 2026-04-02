import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_texas_2026 } from './teams/2026';

export const texasEventData: EventConfig = {
  id: eventsEnum.TEXAS,
  name: 'Valero Texas Open',
  title: 'Texas Open',
  par: 72,
  parByHole: {
    1: 4,
    2: 5,
    3: 3,
    4: 4,
    5: 4,
    6: 4,
    7: 3,
    8: 5,
    9: 4,
    10: 4,
    11: 4,
    12: 4,
    13: 3,
    14: 5,
    15: 4,
    16: 3,
    17: 4,
    18: 5,
  },
  years: {
    2026: {
      id: 401811940,
      teams: teams_texas_2026,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2026-04-02',
      endDate: '2026-04-05',
    },
  },
  Rounds: [1, 2, 3, 4],
};

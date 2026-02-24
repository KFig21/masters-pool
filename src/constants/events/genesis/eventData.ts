import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_genesis_2026 } from './teams/2026';

export const genesisEventData: EventConfig = {
  id: eventsEnum.GENESIS,
  name: 'Genesis Invitational',
  title: 'Genesis',
  par: 71,
  parByHole: {
    1: 5,
    2: 4,
    3: 4,
    4: 3,
    5: 4,
    6: 3,
    7: 4,
    8: 4,
    9: 4,
    10: 4,
    11: 5,
    12: 4,
    13: 4,
    14: 3,
    15: 4,
    16: 3,
    17: 5,
    18: 4,
  },
  years: {
    2026: {
      id: 401811933,
      teams: teams_genesis_2026,
    },
  },
  Rounds: [1, 2, 3, 4],
};

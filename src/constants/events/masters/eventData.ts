import { eventsEnum } from '../../enums';
import type { EventConfig } from '../../../types/event';
import { teams_masters_2025 } from './teams/2025';
import { teams_masters_2026 } from './teams/2026';
import { teams_masters_2023 } from './teams/2023';
import { teams_masters_2022 } from './teams/2022';
import { teams_masters_2021 } from './teams/2021';
import { teams_masters_2020 } from './teams/2020';

export const mastersEventData: EventConfig = {
  id: eventsEnum.MASTERS,
  name: 'The Masters',
  title: 'Masters',
  par: 72,
  parByHole: {
    1: 4,
    2: 5,
    3: 4,
    4: 3,
    5: 4,
    6: 3,
    7: 4,
    8: 5,
    9: 4,
    10: 4,
    11: 4,
    12: 3,
    13: 5,
    14: 4,
    15: 5,
    16: 3,
    17: 4,
    18: 4,
  },
  years: {
    2020: {
      id: 401243010,
      teams: teams_masters_2020,
      rosterSize: 5,
      cutLine: 4,
      startDate: '2020-04-09',
      endDate: '2020-04-12',
    },
    2021: {
      id: 401243010,
      teams: teams_masters_2021,
      rosterSize: 5,
      cutLine: 4,
      startDate: '2021-04-09',
      endDate: '2021-04-12',
    },
    2022: {
      id: 401353232,
      teams: teams_masters_2022,
      rosterSize: 5,
      cutLine: 4,
      startDate: '2022-04-09',
      endDate: '2022-04-12',
    },
    2023: {
      id: 401465508,
      teams: teams_masters_2023,
      rosterSize: 5,
      cutLine: 4,
      startDate: '2023-04-09',
      endDate: '2023-04-12',
    },
    2025: {
      id: 401703504,
      teams: teams_masters_2025,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2025-04-09',
      endDate: '2025-04-12',
    },
    2026: {
      id: 401811933, // TODO: GET THE CORRECT ID FOR 2026, THIS IS THE GENESIS INVITATIONAL ID
      teams: teams_masters_2026,
      rosterSize: 6,
      cutLine: 4,
      startDate: '2026-04-09',
      endDate: '2026-04-12',
    },
  },
  Rounds: [1, 2, 3, 4],
};

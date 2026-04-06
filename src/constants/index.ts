import { eventsEnum } from './enums.ts';
import { mastersEventData } from './events/masters/eventData.ts';
import type { EventMatrix } from '../types/event.ts';
import { genesisEventData } from './events/genesis/eventData.ts';
import { cognizantEventData } from './events/cognizant/eventData.ts';
import { arnoldPalmerEventData } from './events/arnold_palmer/eventData.ts';
import { houstonEventData } from './events/houston/eventData.ts';
import { texasEventData } from './events/texas/eventData.ts';

export const EVENT_MATRIX: EventMatrix = {
  [eventsEnum.MASTERS]: mastersEventData,
  [eventsEnum.GENESIS]: genesisEventData,
  [eventsEnum.COGNIZANT]: cognizantEventData,
  [eventsEnum.ARNOLD_PALMER]: arnoldPalmerEventData,
  [eventsEnum.HOUSTON]: houstonEventData,
  [eventsEnum.TEXAS]: texasEventData,
};

// IMPORTANT: KEEP THESE UPDATED
export const CURRENT_EVENT = eventsEnum.MASTERS;
export const CURRENT_YEAR = 2023;
export const BACKFILL_OVERRIDE = false; // KEEP FALSE

import { eventsEnum } from './enums.ts';
import { mastersEventData } from './events/masters/eventData.ts';
import type { EventMatrix } from '../types/event.ts';
import { genesisEventData } from './events/genesis/eventData.ts';
import { cognizantEventData } from './events/cognizant/eventData.ts';

export const EVENT_MATRIX: EventMatrix = {
  [eventsEnum.MASTERS]: mastersEventData,
  [eventsEnum.GENESIS]: genesisEventData,
  [eventsEnum.COGNIZANT]: cognizantEventData,
};

// VERY IMPORTANT: KEEP THESE UPDATED
export const CURRENT_EVENT = eventsEnum.COGNIZANT;
export const CURRENT_YEAR = 2026;

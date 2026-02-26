import { eventsEnum } from './enums';
import { mastersEventData } from './events/masters/eventData';
import type { EventMatrix } from '../types/event';
import { genesisEventData } from './events/genesis/eventData';
import { cognizantEventData } from './events/cognizant/eventData';

export const EVENT_MATRIX: EventMatrix = {
  [eventsEnum.MASTERS]: mastersEventData,
  [eventsEnum.GENESIS]: genesisEventData,
  [eventsEnum.COGNIZANT]: cognizantEventData,
};

// VERY IMPORTANT: KEEP THESE UPDATED
export const CURRENT_EVENT = eventsEnum.COGNIZANT;
export const CURRENT_YEAR = 2026;

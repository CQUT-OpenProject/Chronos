import {
	buildDateFieldTriggerLabel as buildUiDateFieldTriggerLabel,
	calendarDateToIso,
	formatDateDisplay,
	isoToCalendarDate
} from '@chronos/ui-kit';
import { createHostDateFieldLabels } from './host-form-labels';

export { calendarDateToIso, formatDateDisplay, isoToCalendarDate };

export function buildDateFieldTriggerLabel(label: string, iso: string): string {
	return buildUiDateFieldTriggerLabel(label, iso, createHostDateFieldLabels());
}

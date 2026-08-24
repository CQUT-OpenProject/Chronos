import {
	buildDateFieldTriggerLabel as buildUiDateFieldTriggerLabel,
	calendarDateToIso,
	DEFAULT_DATE_FIELD_LABELS,
	formatDateDisplay,
	isoToCalendarDate,
	type DateFieldLabels
} from '@chronos/ui-kit';
import { hostText } from '$lib/i18n/host-text';

export { calendarDateToIso, formatDateDisplay, isoToCalendarDate, type DateFieldLabels };

export function buildDateFieldTriggerLabel(label: string, iso: string): string {
	return buildUiDateFieldTriggerLabel(label, iso, {
		...DEFAULT_DATE_FIELD_LABELS,
		triggerEmpty: (fieldLabel) => hostText('ui.date.trigger.empty', { label: fieldLabel }),
		triggerLabeled: (fieldLabel, display) =>
			hostText('ui.date.trigger.labeled', { label: fieldLabel, display })
	});
}

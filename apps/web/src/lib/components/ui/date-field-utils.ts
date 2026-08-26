import { hostT } from '$lib/i18n/host-i18n.svelte';
import {
	buildDateFieldTriggerLabel as buildUiDateFieldTriggerLabel,
	calendarDateToIso,
	DEFAULT_DATE_FIELD_LABELS,
	formatDateDisplay,
	isoToCalendarDate,
	type DateFieldLabels
} from '@chronos/ui-kit';

export { calendarDateToIso, formatDateDisplay, isoToCalendarDate, type DateFieldLabels };

export function buildDateFieldTriggerLabel(label: string, iso: string): string {
	return buildUiDateFieldTriggerLabel(label, iso, {
		...DEFAULT_DATE_FIELD_LABELS,
		triggerEmpty: (fieldLabel) => hostT('ui.date.trigger.empty', { label: fieldLabel }),
		triggerLabeled: (fieldLabel, display) =>
			hostT('ui.date.trigger.labeled', { label: fieldLabel, display })
	});
}

import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { DateFieldLabels, TimePickerLabels } from '@chronos/ui-kit';

export function createHostDateFieldLabels(): DateFieldLabels {
	return {
		placeholder: hostT('ui.date.placeholder'),
		today: hostT('ui.date.today'),
		clear: hostT('ui.date.clear'),
		confirm: hostT('ui.date.confirm'),
		triggerEmpty: (fieldLabel) => hostT('ui.date.trigger.empty', { label: fieldLabel }),
		triggerLabeled: (fieldLabel, display) =>
			hostT('ui.date.trigger.labeled', { label: fieldLabel, display })
	};
}

/** Partial labels for embedded TimeWheel columns inside PeriodTimesEditor. */
export function createHostTimeWheelColumnLabels(): Pick<
	TimePickerLabels,
	'hour' | 'minute' | 'columnAria'
> {
	return {
		hour: hostT('ui.time.hour'),
		minute: hostT('ui.time.minute'),
		columnAria: (fieldLabel, column) => hostT('ui.time.column', { label: fieldLabel, column })
	};
}

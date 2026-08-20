import type { OnlineScheduleEvent, OnlineSchedulePayload } from '$lib/models/online-schedule';

export function resolveWeeksToFetch(
	initialPayload: OnlineSchedulePayload,
	requestedWeekNum: string | null | undefined
): string[] {
	const explicitWeek = requestedWeekNum?.trim();
	if (explicitWeek) {
		return [explicitWeek];
	}

	const uniqueWeeks: string[] = [];
	const seen = new Set<string>();
	for (const week of initialPayload.weekList) {
		const trimmed = week.trim();
		if (trimmed && !seen.has(trimmed)) {
			seen.add(trimmed);
			uniqueWeeks.push(trimmed);
		}
	}
	if (uniqueWeeks.length > 0) {
		return uniqueWeeks;
	}

	const fallbackWeek = initialPayload.weekNum.trim();
	return fallbackWeek ? [fallbackWeek] : [];
}

function normalizeEvent(event: OnlineScheduleEvent): OnlineScheduleEvent {
	return {
		...event,
		weekNum: event.weekNum.trim(),
		weekDay: event.weekDay.trim(),
		weekList: event.weekList.map((week) => week.trim()).filter((week) => week.length > 0),
		weekCover: event.weekCover.trim(),
		sessionList: event.sessionList
			.map((session) => session.trim())
			.filter((session) => session.length > 0),
		sessionStart: event.sessionStart.trim(),
		sessionLast: event.sessionLast.trim(),
		eventName: event.eventName.trim(),
		address: event.address.trim(),
		memberName: event.memberName.trim(),
		duplicateGroupType: event.duplicateGroupType.trim(),
		eventType: event.eventType.trim(),
		eventID: event.eventID.trim()
	};
}

function eventIdentityKey(event: OnlineScheduleEvent): string {
	return `${event.weekDay}\0${event.sessionStart}\0${event.sessionLast}\0${event.sessionList.join(',')}\0${event.eventName}\0${event.address}\0${event.memberName}\0${event.eventType}`;
}

function mergeWeekLists(left: string[], right: string[]): string[] {
	const set = new Set(left);
	for (const week of right) {
		set.add(week);
	}
	return [...set].sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10));
}

export function mergeWeekPayloads(
	initialPayload: OnlineSchedulePayload,
	payloads: OnlineSchedulePayload[]
): OnlineSchedulePayload {
	const mergedEvents = new Map<string, OnlineScheduleEvent>();

	for (const payload of payloads) {
		for (const event of payload.eventList) {
			const normalizedEvent = normalizeEvent(event);
			const key = eventIdentityKey(normalizedEvent);
			const existing = mergedEvents.get(key);
			if (!existing) {
				mergedEvents.set(key, normalizedEvent);
				continue;
			}
			mergedEvents.set(key, {
				...existing,
				weekList: mergeWeekLists(existing.weekList, normalizedEvent.weekList)
			});
		}
	}

	return {
		...initialPayload,
		yearTerm: initialPayload.yearTerm.trim(),
		weekNum: initialPayload.weekNum.trim(),
		nowMonth: initialPayload.nowMonth.trim(),
		yearTermList: [
			...new Set(initialPayload.yearTermList.map((term) => term.trim()).filter(Boolean))
		],
		weekList: [...new Set(initialPayload.weekList.map((week) => week.trim()).filter(Boolean))],
		weekDayList: initialPayload.weekDayList,
		eventList: [...mergedEvents.values()]
	};
}

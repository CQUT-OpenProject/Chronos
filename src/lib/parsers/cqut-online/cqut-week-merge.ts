import type { OnlineScheduleEvent, OnlineSchedulePayload } from '$lib/models/online-schedule';

export function resolveWeeksToFetch(
	initialPayload: OnlineSchedulePayload,
	requestedWeekNum: string | null | undefined
): string[] {
	const explicitWeek = requestedWeekNum?.trim();
	if (explicitWeek) {
		return [explicitWeek];
	}

	const termWeeks = initialPayload.weekList
		.map((week) => week.trim())
		.filter((week) => week.length > 0);
	const uniqueWeeks = [...new Set(termWeeks)];
	if (uniqueWeeks.length > 0) {
		return uniqueWeeks;
	}

	const fallbackWeek = initialPayload.weekNum.trim();
	return fallbackWeek ? [fallbackWeek] : [];
}

interface OnlineScheduleEventKey {
	weekDay: string;
	sessionList: string[];
	sessionStart: string;
	sessionLast: string;
	eventName: string;
	address: string;
	memberName: string;
	eventType: string;
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

function eventKey(event: OnlineScheduleEvent): OnlineScheduleEventKey {
	return {
		weekDay: event.weekDay,
		sessionList: event.sessionList,
		sessionStart: event.sessionStart,
		sessionLast: event.sessionLast,
		eventName: event.eventName,
		address: event.address,
		memberName: event.memberName,
		eventType: event.eventType
	};
}

function mergeWeekLists(left: string[], right: string[]): string[] {
	return [...new Set([...left, ...right])].sort(
		(a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10)
	);
}

function eventKeyToString(key: OnlineScheduleEventKey): string {
	return JSON.stringify(key);
}

export function mergeWeekPayloads(
	initialPayload: OnlineSchedulePayload,
	payloads: OnlineSchedulePayload[]
): OnlineSchedulePayload {
	const mergedEvents = new Map<string, OnlineScheduleEvent>();

	for (const payload of payloads) {
		for (const event of payload.eventList) {
			const normalizedEvent = normalizeEvent(event);
			const key = eventKeyToString(eventKey(normalizedEvent));
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

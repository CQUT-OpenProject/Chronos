import { z } from 'zod';
import type {
	OnlineScheduleEvent,
	OnlineSchedulePayload,
	OnlineScheduleWeekDay
} from './online-schedule';

const weekDaySchema = z.object({
	weekDay: z.string().default(''),
	weekDate: z.string().default(''),
	today: z.boolean().default(false)
});

const eventSchema = z.object({
	weekNum: z.string().default(''),
	weekDay: z.string().default(''),
	weekList: z.array(z.string()).default([]),
	weekCover: z.string().default(''),
	sessionList: z.array(z.string()).default([]),
	sessionStart: z.string().default(''),
	sessionLast: z.string().default(''),
	eventName: z.string().default(''),
	address: z.string().default(''),
	memberName: z.string().default(''),
	remark: z.string().default(''),
	duplicateGroupType: z.string().default(''),
	duplicateGroup: z.number().default(0),
	eventType: z.string().default(''),
	eventID: z.string().default('')
});

export const onlineSchedulePayloadSchema = z.object({
	yearTerm: z.string().default(''),
	weekNum: z.string().default(''),
	nowMonth: z.string().default(''),
	importSource: z.string().default(''),
	termStartDate: z.string().nullable().optional().default(null),
	yearTermList: z.array(z.string()).default([]),
	weekList: z.array(z.string()).default([]),
	weekDayList: z.array(weekDaySchema).default([]),
	eventList: z.array(eventSchema).default([])
});

const PAYLOAD_KEY_MAP: Record<string, keyof OnlineSchedulePayload> = {
	yt: 'yearTerm',
	yearTerm: 'yearTerm',
	wn: 'weekNum',
	weekNum: 'weekNum',
	nm: 'nowMonth',
	nowMonth: 'nowMonth',
	is: 'importSource',
	importSource: 'importSource',
	ts: 'termStartDate',
	termStartDate: 'termStartDate',
	yl: 'yearTermList',
	yearTermList: 'yearTermList',
	wl: 'weekList',
	weekList: 'weekList',
	wd: 'weekDayList',
	weekDayList: 'weekDayList',
	el: 'eventList',
	eventList: 'eventList'
};

const WEEK_DAY_KEY_MAP: Record<string, keyof OnlineScheduleWeekDay> = {
	wd: 'weekDay',
	weekDay: 'weekDay',
	dt: 'weekDate',
	weekDate: 'weekDate',
	td: 'today',
	today: 'today'
};

const EVENT_KEY_MAP: Record<string, keyof OnlineScheduleEvent> = {
	wn: 'weekNum',
	weekNum: 'weekNum',
	wd: 'weekDay',
	weekDay: 'weekDay',
	wl: 'weekList',
	weekList: 'weekList',
	wc: 'weekCover',
	weekCover: 'weekCover',
	sl: 'sessionList',
	sessionList: 'sessionList',
	ss: 'sessionStart',
	sessionStart: 'sessionStart',
	se: 'sessionLast',
	sessionLast: 'sessionLast',
	en: 'eventName',
	eventName: 'eventName',
	ad: 'address',
	address: 'address',
	mn: 'memberName',
	memberName: 'memberName',
	rm: 'remark',
	remark: 'remark',
	gt: 'duplicateGroupType',
	duplicateGroupType: 'duplicateGroupType',
	dg: 'duplicateGroup',
	duplicateGroup: 'duplicateGroup',
	et: 'eventType',
	eventType: 'eventType',
	id: 'eventID',
	eventID: 'eventID'
};

const PAYLOAD_SHORT_KEYS: Record<keyof OnlineSchedulePayload, string> = {
	yearTerm: 'yt',
	weekNum: 'wn',
	nowMonth: 'nm',
	importSource: 'is',
	termStartDate: 'ts',
	yearTermList: 'yl',
	weekList: 'wl',
	weekDayList: 'wd',
	eventList: 'el'
};

const WEEK_DAY_SHORT_KEYS: Record<keyof OnlineScheduleWeekDay, string> = {
	weekDay: 'wd',
	weekDate: 'dt',
	today: 'td'
};

const EVENT_SHORT_KEYS: Record<keyof OnlineScheduleEvent, string> = {
	weekNum: 'wn',
	weekDay: 'wd',
	weekList: 'wl',
	weekCover: 'wc',
	sessionList: 'sl',
	sessionStart: 'ss',
	sessionLast: 'se',
	eventName: 'en',
	address: 'ad',
	memberName: 'mn',
	remark: 'rm',
	duplicateGroupType: 'gt',
	duplicateGroup: 'dg',
	eventType: 'et',
	eventID: 'id'
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeWeekDay(raw: unknown): Record<string, unknown> {
	if (!isRecord(raw)) return {};
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(raw)) {
		const mapped = WEEK_DAY_KEY_MAP[key];
		if (mapped) result[mapped] = value;
	}
	return result;
}

function normalizeEvent(raw: unknown): Record<string, unknown> {
	if (!isRecord(raw)) return {};
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(raw)) {
		const mapped = EVENT_KEY_MAP[key];
		if (mapped) result[mapped] = value;
	}
	return result;
}

export function normalizeShareJson(raw: unknown): unknown {
	if (!isRecord(raw)) return raw;
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(raw)) {
		const mapped = PAYLOAD_KEY_MAP[key];
		if (!mapped) continue;
		if (mapped === 'weekDayList' && Array.isArray(value)) {
			result.weekDayList = value.map(normalizeWeekDay);
		} else if (mapped === 'eventList' && Array.isArray(value)) {
			result.eventList = value.map(normalizeEvent);
		} else {
			result[mapped] = value;
		}
	}
	return result;
}

export function parseOnlineSchedulePayload(json: string): OnlineSchedulePayload {
	const raw = JSON.parse(json) as unknown;
	return onlineSchedulePayloadSchema.parse(normalizeShareJson(raw));
}

export function encodeOnlineSchedulePayload(payload: OnlineSchedulePayload): string {
	const shortPayload: Record<string, unknown> = {};
	for (const [longKey, shortKey] of Object.entries(PAYLOAD_SHORT_KEYS) as [
		keyof OnlineSchedulePayload,
		string
	][]) {
		const value = payload[longKey];
		if (longKey === 'termStartDate' && (value === null || value === undefined)) {
			continue;
		}
		if (longKey === 'weekDayList') {
			shortPayload[shortKey] = (value as OnlineScheduleWeekDay[]).map((day) => {
				const item: Record<string, unknown> = {};
				for (const [dayLong, dayShort] of Object.entries(WEEK_DAY_SHORT_KEYS) as [
					keyof OnlineScheduleWeekDay,
					string
				][]) {
					item[dayShort] = day[dayLong];
				}
				return item;
			});
		} else if (longKey === 'eventList') {
			shortPayload[shortKey] = (value as OnlineScheduleEvent[]).map((event) => {
				const item: Record<string, unknown> = {};
				for (const [eventLong, eventShort] of Object.entries(EVENT_SHORT_KEYS) as [
					keyof OnlineScheduleEvent,
					string
				][]) {
					item[eventShort] = event[eventLong];
				}
				return item;
			});
		} else {
			shortPayload[shortKey] = value;
		}
	}
	return JSON.stringify(shortPayload);
}

import { z } from 'zod';

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

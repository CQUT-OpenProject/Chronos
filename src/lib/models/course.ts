import { z } from 'zod';

export const COURSE_REMARK_MAX_LENGTH = 200;

const courseSchema = z.object({
	id: z.string(),
	name: z.string(),
	teacher: z.string(),
	location: z.string(),
	dayOfWeek: z.number().int(),
	startPeriod: z.number().int(),
	endPeriod: z.number().int(),
	color: z.string(),
	textColor: z.string().default('#21005D'),
	weeks: z.array(z.number().int()).default([]),
	remark: z.string().max(COURSE_REMARK_MAX_LENGTH).default('')
});

export type Course = z.infer<typeof courseSchema>;

export function createCourse(
	partial: Omit<Course, 'textColor' | 'weeks' | 'remark'> &
		Partial<Pick<Course, 'textColor' | 'weeks' | 'remark'>>
): Course {
	return {
		textColor: '#21005D',
		weeks: [],
		remark: '',
		...partial
	};
}

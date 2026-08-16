export const COURSE_REMARK_MAX_LENGTH = 200;

export interface Course {
	id: string;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	color: string;
	textColor: string;
	weeks: number[];
	remark: string;
}

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

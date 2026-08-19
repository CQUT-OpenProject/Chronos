export const COURSE_REMARK_MAX_LENGTH = 200;

export interface Course {
	id: string;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number; // 1 (Monday) - 7 (Sunday)
	startPeriod: number; // 1-indexed start period
	endPeriod: number; // 1-indexed end period
	weeks: number[]; // e.g. [1, 2, 3, 5]
	color?: string; // Hex background color (derived dynamically by theme if undefined)
	textColor?: string; // Foreground text color
	remark?: string;
	/** Plugin-specific metadata keyed by plugin ID */
	customMetadata?: Record<string, unknown>;
}

export function createCourse(
	partial: Omit<Course, 'weeks' | 'teacher' | 'location'> &
		Partial<Pick<Course, 'weeks' | 'teacher' | 'location'>>
): Course {
	return {
		teacher: '',
		location: '',
		weeks: [],
		remark: '',
		...partial
	};
}

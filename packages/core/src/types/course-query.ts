import type { Course } from '../domain/course';

export interface CourseQueryFilter {
	/** Limit to specific timetables; omit to query all */
	timetableIds?: string[];
	/** Day of week, 1=Monday … 7=Sunday; single value or array */
	dayOfWeek?: number | number[];
	/** Academic week; empty course weeks array matches all weeks */
	week?: number;
	/** Location/room: exact string or contains/exact object */
	location?: string | { contains?: string; exact?: string };
	/** Case-insensitive substring match on course name */
	nameContains?: string;
	/** Case-insensitive substring match on teacher name */
	teacherContains?: string;
}

export interface CourseQueryHit {
	timetableId: string;
	timetableName: string;
	course: Course;
}

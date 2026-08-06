import type { Timetable } from '$lib/models/timetable';
import type { AppResult } from '../result';

export interface EducationalTimetableHtmlParser {
	parse(content: string): AppResult<Timetable | null>;
	parseBytes(contentBytes: Uint8Array): AppResult<Timetable | null>;
}

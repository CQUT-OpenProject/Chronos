import type { Timetable } from '$lib/models/timetable';
import type { AppResult } from '../result/app-result';

export interface TimetableShareLinkCodec {
	/** Returns null when content is not a share link; otherwise decode result. */
	decodeFromText(content: string): AppResult<Timetable> | null;
	encodeClipboardText(timetable: Timetable, origin?: string): AppResult<string>;
	estimatePayloadLength(timetable: Timetable): number;
}

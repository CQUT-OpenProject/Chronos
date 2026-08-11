import type { Timetable } from '$lib/models/timetable';
import type { AppResult } from '../result/app-result';

/**
 * Share-link codec seam: user-facing URLs and clipboard text (binary + Brotli).
 * Default adapter: `ChronosTimetableShareLinkCodec`.
 * Online import uses `TimetableShareCodec` instead — do not merge the two interfaces.
 *
 * | Entry                         | Use case / route                         | Direction |
 * | ----------------------------- | ---------------------------------------- | --------- |
 * | Clipboard "share link" tab    | `PreviewImportedTimetableUseCase.invoke` | decode    |
 * | `/s` deep link                | `chronos-share-link-codec` → confirm page | decode    |
 * | Export page                   | `ExportCurrentTimetableUseCase`          | encode    |
 * | Online edu / HTML             | —                                        | not used  |
 */
export interface TimetableShareLinkCodec {
	/** Returns null when content is not a share link; otherwise decode result. */
	decodeFromText(content: string): Promise<AppResult<Timetable> | null>;
	encodeClipboardText(timetable: Timetable, origin?: string): Promise<AppResult<string>>;
	estimatePayloadLength(timetable: Timetable): Promise<number>;
}

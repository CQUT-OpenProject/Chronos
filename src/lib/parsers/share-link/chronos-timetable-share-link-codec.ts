import type { Timetable } from '$lib/models/timetable';
import type { TimetableShareLinkCodec } from '$lib/domain/interfaces/timetable-share-link-codec';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromText,
	formatShareClipboardText
} from './chronos-share-link-codec';

export class ChronosTimetableShareLinkCodec implements TimetableShareLinkCodec {
	async decodeFromText(content: string): Promise<AppResult<Timetable> | null> {
		const payload = extractSharePayloadFromText(content);
		if (!payload) return null;
		return decodeSharePayload(payload);
	}

	async encodeClipboardText(timetable: Timetable, origin?: string): Promise<AppResult<string>> {
		try {
			const link = await encodeShareLink(timetable, origin);
			return success(formatShareClipboardText(timetable.name, link));
		} catch {
			return failure(AppError.dataFormat('课表导出失败'));
		}
	}

	estimatePayloadLength(timetable: Timetable): Promise<number> {
		return estimateShareLinkLength(timetable);
	}
}

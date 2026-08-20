import type { Timetable } from '$lib/models/timetable';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromText,
	formatShareClipboardText
} from './chronos-share-link-codec';

export class ChronosTimetableShareLinkCodec {
	async decode(content: string): Promise<AppResult<Timetable>> {
		const payload = extractSharePayloadFromText(content);
		if (!payload) {
			return failure(AppError.dataFormat('未识别到有效的课表分享链接'));
		}
		return decodeSharePayload(payload);
	}

	async decodeFromText(content: string): Promise<AppResult<Timetable> | null> {
		const payload = extractSharePayloadFromText(content);
		if (!payload) return null;
		return decodeSharePayload(payload);
	}

	async encode(timetable: Timetable, origin?: string): Promise<AppResult<string>> {
		try {
			const link = await encodeShareLink(timetable, origin);
			return success(formatShareClipboardText(timetable.name, link));
		} catch {
			return failure(AppError.dataFormat('课表导出失败'));
		}
	}

	async encodeClipboardText(timetable: Timetable, origin?: string): Promise<AppResult<string>> {
		return this.encode(timetable, origin);
	}

	estimatePayloadLength(timetable: Timetable): Promise<number> {
		return estimateShareLinkLength(timetable);
	}
}

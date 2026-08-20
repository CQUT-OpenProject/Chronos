import type { Timetable } from '@chronos/core';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromText,
	formatShareClipboardText,
	type ShareLinkResult
} from './chronos-share-link-codec';

export type CodecResult<T> = { ok: true; value: T } | { ok: false; error: { message: string } };

function codecSuccess<T>(value: T): CodecResult<T> {
	return { ok: true, value };
}

function codecFailure<T>(message: string): CodecResult<T> {
	return { ok: false, error: { message } };
}

function fromShareLinkResult<T>(result: ShareLinkResult<T>): CodecResult<T> {
	if (result.ok) {
		return codecSuccess(result.value);
	}
	return codecFailure(result.errorMessage);
}

export class ChronosTimetableShareLinkCodec {
	async decode(content: string): Promise<CodecResult<Timetable>> {
		const payload = extractSharePayloadFromText(content);
		if (!payload) {
			return codecFailure('未识别到有效的课表分享链接');
		}
		return fromShareLinkResult(await decodeSharePayload(payload));
	}

	async decodeFromText(content: string): Promise<CodecResult<Timetable> | null> {
		const payload = extractSharePayloadFromText(content);
		if (!payload) return null;
		return fromShareLinkResult(await decodeSharePayload(payload));
	}

	async encode(timetable: Timetable, origin?: string): Promise<CodecResult<string>> {
		try {
			const link = await encodeShareLink(timetable, origin);
			return codecSuccess(formatShareClipboardText(timetable.name, link));
		} catch {
			return codecFailure('课表导出失败');
		}
	}

	async encodeClipboardText(timetable: Timetable, origin?: string): Promise<CodecResult<string>> {
		return this.encode(timetable, origin);
	}

	estimatePayloadLength(timetable: Timetable): Promise<number> {
		return estimateShareLinkLength(timetable);
	}
}

import type { Timetable } from '@chronos/core';
import { normalizeTimetableName } from '@chronos/core';
import {
	decodeBinaryToTimetable,
	encodeTimetableToBinary,
	ShareBinaryDecodeError
} from './chronos-share-binary';
import {
	appendCrc32,
	verifyAndStripCrc32,
	bytesToBase64Url,
	base64UrlToBytes
} from '@chronos/codec-kit';
import {
	compressShareAdaptive,
	decompressShareAdaptive,
	SHARE_LINK_VERSION_BROTLI,
	SHARE_LINK_VERSION_DEFLATE,
	ShareDecompressionTooLargeError
} from './share-link-brotli';
import { SHARE_CODEC_MESSAGES } from '../messages';

export const SHARE_LINK_VERSION = SHARE_LINK_VERSION_BROTLI;
export const SHARE_LINK_PREFIX = `${SHARE_LINK_VERSION}.`;
export const SHARE_LINK_PREFIX_DEFLATE = `${SHARE_LINK_VERSION_DEFLATE}.`;
export const SHARE_LINK_WARNING_LENGTH = 800;
/** Upper bound for encoded share payloads (worst legit timetable encodes to ~10K chars). */
export const MAX_SHARE_PAYLOAD_CHARS = 65_536;

type ShareCodecLabels = (typeof SHARE_CODEC_MESSAGES)['zh-cn'];
const DEFAULT_SHARE_LABELS: ShareCodecLabels = SHARE_CODEC_MESSAGES['zh-cn'];

export type ShareDecodeLabels = {
	'share.error.corrupted': string;
	'share.error.unsupported': string;
	'share.error.parseFailed': string;
};

export type ShareClipboardLabels = {
	'share.clipboard.unnamed': string;
	'share.clipboard.template': string;
};

export type ShareLinkResult<T> = { ok: true; value: T } | { ok: false; errorMessage: string };

function shareSuccess<T>(value: T): ShareLinkResult<T> {
	return { ok: true, value };
}

function shareFailure<T>(errorMessage: string): ShareLinkResult<T> {
	return { ok: false, errorMessage };
}

export async function encodeSharePayload(timetable: Timetable): Promise<string> {
	const binary = appendCrc32(encodeTimetableToBinary(timetable));
	const { version, bytes } = await compressShareAdaptive(binary);
	const prefix =
		version === SHARE_LINK_VERSION_DEFLATE ? SHARE_LINK_PREFIX_DEFLATE : SHARE_LINK_PREFIX;
	return `${prefix}${bytesToBase64Url(bytes)}`;
}

function parseShareLinkVersion(payload: string): { version: number; encoded: string } | null {
	const dot = payload.indexOf('.');
	if (dot <= 0) return null;
	const v = Number(payload.slice(0, dot));
	if (!Number.isInteger(v) || v < 1) return null;
	return { version: v, encoded: payload.slice(dot + 1) };
}

export async function decodeSharePayload(
	payload: string,
	labels: ShareDecodeLabels = DEFAULT_SHARE_LABELS
): Promise<ShareLinkResult<Timetable>> {
	const normalized = payload.trim();
	if (normalized.length > MAX_SHARE_PAYLOAD_CHARS) {
		return shareFailure(labels['share.error.corrupted']);
	}
	const parsed = parseShareLinkVersion(normalized);
	if (
		!parsed ||
		(parsed.version !== SHARE_LINK_VERSION_BROTLI && parsed.version !== SHARE_LINK_VERSION_DEFLATE)
	) {
		return shareFailure(labels['share.error.unsupported']);
	}

	try {
		const compressed = base64UrlToBytes(parsed.encoded);
		const decompressed = await decompressShareAdaptive(parsed.version, compressed);
		const verified = verifyAndStripCrc32(decompressed);
		if (!verified) throw new ShareBinaryDecodeError('checksum mismatch');
		return shareSuccess(decodeBinaryToTimetable(verified));
	} catch (error) {
		if (error instanceof ShareDecompressionTooLargeError) {
			return shareFailure(labels['share.error.corrupted']);
		}
		const message =
			error instanceof ShareBinaryDecodeError
				? error.message === 'checksum mismatch'
					? labels['share.error.corrupted']
					: error.message
				: error instanceof Error
					? error.message
					: labels['share.error.parseFailed'];
		return shareFailure(message);
	}
}

export async function encodeShareLink(timetable: Timetable, origin = ''): Promise<string> {
	const payload = await encodeSharePayload(timetable);
	const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
	return `${base}/s#${payload}`;
}

export function formatShareClipboardText(
	timetableName: string,
	link: string,
	labels: ShareClipboardLabels = DEFAULT_SHARE_LABELS
): string {
	const name = normalizeTimetableName(timetableName) || labels['share.clipboard.unnamed'];
	return labels['share.clipboard.template'].replace('{name}', name).replace('{link}', link);
}

export async function estimateShareLinkLength(timetable: Timetable): Promise<number> {
	return (await encodeSharePayload(timetable)).length;
}

function isValidSharePayloadFormat(payload: string): boolean {
	const dot = payload.indexOf('.');
	if (dot <= 0) return false;
	const v = Number(payload.slice(0, dot));
	return v === SHARE_LINK_VERSION_BROTLI || v === SHARE_LINK_VERSION_DEFLATE;
}

/**
 * Drops trailing punctuation users pick up when copying links from chat apps
 * (e.g. 。, ., )). Only the trailing run is stripped: legitimate payloads
 * always end with base64url characters, while the version dot never trails.
 */
function stripSharePayloadTail(candidate: string): string {
	return candidate.replace(/[^A-Za-z0-9\-_]+$/, '');
}

function tryDecodeURIComponent(value: string): string {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

function normalizeSharePayload(candidate: string): string | null {
	const payload = stripSharePayloadTail(
		tryDecodeURIComponent(candidate.trim().split(/\s/)[0] ?? '')
	);
	return isValidSharePayloadFormat(payload) ? payload : null;
}

function extractSharePayloadFromUrlString(value: string): string | null {
	const trimmed = value.trim();
	try {
		const url = new URL(trimmed);
		const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
		const fromHash = normalizeSharePayload(hash);
		if (fromHash) return fromHash;
		const queryPayload = url.searchParams.get('d');
		if (queryPayload) return normalizeSharePayload(queryPayload);
	} catch {
		const hashIndex = trimmed.indexOf('#');
		if (hashIndex >= 0) {
			const fromHash = normalizeSharePayload(trimmed.slice(hashIndex + 1));
			if (fromHash) return fromHash;
		}
	}
	return null;
}

export function extractSharePayloadFromLocation(location: Location): string | null {
	const hash = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
	const strippedHash = stripSharePayloadTail(tryDecodeURIComponent(hash));
	if (isValidSharePayloadFormat(strippedHash)) return strippedHash;
	const queryPayload = new URLSearchParams(location.search).get('d');
	if (queryPayload) {
		// URLSearchParams already percent-decodes: strip only, never decode twice.
		const stripped = stripSharePayloadTail(queryPayload);
		if (isValidSharePayloadFormat(stripped)) return stripped;
	}
	return null;
}

export function extractSharePayloadFromText(text: string): string | null {
	const trimmed = text.trim();
	const direct = normalizeSharePayload(trimmed);
	if (direct) return direct;

	for (const line of trimmed.split(/\r?\n/)) {
		const match = line.trim().match(/https?:\/\/\S+/);
		if (!match) continue;
		const fromLine = extractSharePayloadFromUrlString(match[0]);
		if (fromLine) return fromLine;
	}

	return extractSharePayloadFromUrlString(trimmed);
}

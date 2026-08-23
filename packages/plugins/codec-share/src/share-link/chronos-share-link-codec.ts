import type { Timetable } from '@chronos/core';
import { normalizeTimetableName } from '@chronos/core';
import {
	decodeBinaryToTimetable,
	encodeTimetableToBinary,
	ShareBinaryDecodeError
} from './chronos-share-binary';
import { appendCrc32, verifyAndStripCrc32 } from '@chronos/codec-kit';
import {
	compressShareAdaptive,
	decompressShareAdaptive,
	SHARE_LINK_VERSION_BROTLI,
	SHARE_LINK_VERSION_DEFLATE
} from './share-link-brotli';

export const SHARE_LINK_VERSION = SHARE_LINK_VERSION_BROTLI;
export const SHARE_LINK_PREFIX = `${SHARE_LINK_VERSION}.`;
export const SHARE_LINK_PREFIX_DEFLATE = `${SHARE_LINK_VERSION_DEFLATE}.`;
export const SHARE_LINK_WARNING_LENGTH = 800;
export const SHARE_LINK_CORRUPTED_MESSAGE = '分享链接已损坏或内容不完整';

export type ShareLinkResult<T> = { ok: true; value: T } | { ok: false; errorMessage: string };

function shareSuccess<T>(value: T): ShareLinkResult<T> {
	return { ok: true, value };
}

function shareFailure<T>(errorMessage: string): ShareLinkResult<T> {
	return { ok: false, errorMessage };
}

function bytesToBase64Url(bytes: Uint8Array): string {
	const CHUNK_SIZE = 8192;
	let binary = '';
	for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
		const chunk = bytes.subarray(i, i + CHUNK_SIZE);
		binary += String.fromCharCode(...chunk);
	}
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
	const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let index = 0; index < binary.length; index += 1) {
		bytes[index] = binary.charCodeAt(index);
	}
	return bytes;
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

export async function decodeSharePayload(payload: string): Promise<ShareLinkResult<Timetable>> {
	const normalized = payload.trim();
	const parsed = parseShareLinkVersion(normalized);
	if (
		!parsed ||
		(parsed.version !== SHARE_LINK_VERSION_BROTLI && parsed.version !== SHARE_LINK_VERSION_DEFLATE)
	) {
		return shareFailure('不支持的分享链接格式');
	}

	try {
		const compressed = base64UrlToBytes(parsed.encoded);
		const decompressed = await decompressShareAdaptive(parsed.version, compressed);
		const verified = verifyAndStripCrc32(decompressed);
		if (!verified) throw new ShareBinaryDecodeError('checksum mismatch');
		return shareSuccess(decodeBinaryToTimetable(verified));
	} catch (error) {
		const message =
			error instanceof ShareBinaryDecodeError
				? error.message === 'checksum mismatch'
					? SHARE_LINK_CORRUPTED_MESSAGE
					: error.message
				: error instanceof Error
					? error.message
					: '分享链接解析失败';
		return shareFailure(message);
	}
}

export async function encodeShareLink(timetable: Timetable, origin = ''): Promise<string> {
	const payload = await encodeSharePayload(timetable);
	const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
	return `${base}/s#${payload}`;
}

export function formatShareClipboardText(timetableName: string, link: string): string {
	const name = normalizeTimetableName(timetableName);
	return `我分享了一张课表：「${name}」\n复制这段文本后，打开 Chronos，选择从【分享链接】方式导入\n${link}`;
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

function normalizeSharePayload(candidate: string): string | null {
	const payload = candidate.trim().split(/\s/)[0] ?? '';
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
	if (isValidSharePayloadFormat(hash)) return hash;
	const queryPayload = new URLSearchParams(location.search).get('d');
	if (queryPayload && isValidSharePayloadFormat(queryPayload)) return queryPayload;
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

import type { CapturedError } from '@chronos/core';
import {
	ERROR_LOG_MAX_ENTRIES,
	ERROR_LOG_MESSAGE_MAX_LENGTH,
	ERROR_LOG_PLUGIN_ID,
	ERROR_LOG_STACK_MAX_LENGTH
} from './constants';

export type ErrorLogEntry = CapturedError;

export interface ClipboardFormatOptions {
	pluginVersion: string;
	userAgent?: string;
}

function truncate(value: string, maxLength: number): string {
	if (value.length <= maxLength) return value;
	return `${value.slice(0, maxLength)}…`;
}

export function truncateErrorLogEntry(entry: ErrorLogEntry): ErrorLogEntry {
	return {
		...entry,
		message: truncate(entry.message, ERROR_LOG_MESSAGE_MAX_LENGTH),
		stack: entry.stack ? truncate(entry.stack, ERROR_LOG_STACK_MAX_LENGTH) : undefined
	};
}

function isValidEntry(value: unknown): value is ErrorLogEntry {
	if (!value || typeof value !== 'object') return false;
	const entry = value as ErrorLogEntry;
	return (
		typeof entry.id === 'string' &&
		typeof entry.ts === 'number' &&
		(entry.source === 'error' ||
			entry.source === 'unhandledrejection' ||
			entry.source === 'console') &&
		typeof entry.message === 'string'
	);
}

export function parseStoredEntries(data: unknown): ErrorLogEntry[] {
	if (!Array.isArray(data)) return [];
	return data.filter(isValidEntry).map(truncateErrorLogEntry);
}

export function appendRingBuffer(
	entries: readonly ErrorLogEntry[],
	entry: ErrorLogEntry,
	maxEntries = ERROR_LOG_MAX_ENTRIES
): ErrorLogEntry[] {
	const next = [...entries, truncateErrorLogEntry(entry)];
	if (next.length <= maxEntries) return next;
	return next.slice(next.length - maxEntries);
}

function formatEntryBlock(entry: ErrorLogEntry): string {
	const iso = new Date(entry.ts).toISOString();
	const namePart = entry.name ? ` / ${entry.name}` : '';
	const lines = [`${iso} / ${entry.source}${namePart} / ${entry.message}`];
	if (entry.stack) {
		lines.push(entry.stack);
	}
	return lines.join('\n');
}

export function formatErrorLogClipboard(
	entries: readonly ErrorLogEntry[],
	options: ClipboardFormatOptions
): string {
	const header = ['Chronos Error Log', `Plugin: ${ERROR_LOG_PLUGIN_ID} v${options.pluginVersion}`];
	if (options.userAgent) {
		header.push(`User-Agent: ${options.userAgent}`);
	}
	const body = [...entries]
		.sort((a, b) => b.ts - a.ts)
		.map(formatEntryBlock)
		.join('\n\n');
	return body ? `${header.join('\n')}\n\n---\n\n${body}` : header.join('\n');
}

const BUILDING_ROOM_PATTERN = /^(.+?[楼馆])([A-Za-z]?\d[\w]*)$/;
export const ROOM_BYTE_LENGTH = 5;
export const NO_BUILDING = 0xff;

export type ParsedLocation =
	| { kind: 'split'; building: string; room: string }
	| { kind: 'full'; value: string };

export function parseLocation(address: string): ParsedLocation {
	const trimmed = address.trim();
	if (!trimmed) return { kind: 'full', value: '' };

	const match = BUILDING_ROOM_PATTERN.exec(trimmed);
	if (!match?.[1] || !match[2]) return { kind: 'full', value: trimmed };

	return { kind: 'split', building: match[1], room: match[2].slice(0, ROOM_BYTE_LENGTH) };
}

export function formatLocation(parsed: ParsedLocation): string {
	if (parsed.kind === 'full') return parsed.value;
	return `${parsed.building}${parsed.room}`;
}

export function writeRoomBytes(room: string, target: number[]): void {
	const normalized = room.trim().slice(0, ROOM_BYTE_LENGTH);
	for (let index = 0; index < ROOM_BYTE_LENGTH; index += 1) {
		const code = normalized.charCodeAt(index);
		target.push(index < normalized.length && code > 0 ? code : 0x20);
	}
}

export function readRoomBytes(bytes: Uint8Array, offset: number): string {
	let room = '';
	for (let index = 0; index < ROOM_BYTE_LENGTH; index += 1) {
		const code = bytes[offset + index];
		if (code === undefined || code === 0x20 || code === 0) continue;
		room += String.fromCharCode(code);
	}
	return room.trim();
}

export function isEmptyRoom(room: string): boolean {
	return room.trim().length === 0;
}

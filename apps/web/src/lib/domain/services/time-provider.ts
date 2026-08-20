export interface TimeProvider {
	today(): string;
	currentTime(): string;
	currentTimeMillis(): number;
}

export class SystemTimeProvider implements TimeProvider {
	today(): string {
		return formatLocalIsoDate(new Date());
	}

	currentTime(): string {
		const now = new Date();
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		return `${hours}:${minutes}`;
	}

	currentTimeMillis(): number {
		return Date.now();
	}
}

function formatLocalIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

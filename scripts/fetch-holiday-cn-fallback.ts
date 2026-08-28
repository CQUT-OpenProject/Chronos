import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'packages/plugins/calendar-holidays/static/data');
const baseUrl = 'https://fastly.jsdelivr.net/gh/NateScarlet/holiday-cn@master';

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

mkdirSync(dataDir, { recursive: true });

for (const year of years) {
	const response = await fetch(`${baseUrl}/${year}.json`);
	if (!response.ok) {
		console.warn(`Skipped holiday-cn ${year}: HTTP ${response.status}`);
		continue;
	}
	const payload = await response.text();
	writeFileSync(resolve(dataDir, `${year}.json`), `${payload.trim()}\n`, 'utf8');
	console.log(`Updated fallback: ${year}.json`);
}

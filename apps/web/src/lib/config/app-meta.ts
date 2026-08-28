import packageJson from '../../../package.json';

declare const __BUILD_TIME__: string;

export const APP_VERSION = packageJson.version;
export const BUILD_TIME = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : '';
export const SOURCE_CODE_URL = 'https://github.com/CQUT-OpenProject/Chronos';
const COPYRIGHT_START_YEAR = 2026;
export const COPYRIGHT_HOLDER = 'CQUT-OpenProject';
export const PROJECT_LICENSE = 'Apache-2.0';

export function formatCopyrightYearRange(
	startYear = COPYRIGHT_START_YEAR,
	currentYear = new Date().getFullYear()
): string {
	return currentYear <= startYear ? String(startYear) : `${startYear}-${currentYear}`;
}

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
	formatThirdPartyLicenses,
	writeGeneratedThirdPartyLicenses,
	type BundledLicenseInfo
} from './third-party-license-generator';

describe('third-party-license-generator', () => {
	let outputDir: string;

	afterEach(() => {
		if (outputDir) rmSync(outputDir, { recursive: true, force: true });
	});

	it('deduplicates, excludes @chronos/*, and sorts by name', () => {
		const deps: BundledLicenseInfo[] = [
			{ name: 'swiper', version: '14.0.0', license: 'MIT' },
			{ name: 'dexie', version: '4.0.0', license: 'Apache-2.0' },
			{ name: 'swiper', version: '14.0.1', license: 'MIT' },
			{ name: '@chronos/core', version: '0.1.0', license: 'Apache-2.0' },
			{ name: 'bits-ui', version: '2.0.0', license: 'MIT' }
		];

		expect(formatThirdPartyLicenses(deps)).toEqual([
			{ name: 'bits-ui', license: 'MIT' },
			{ name: 'dexie', license: 'Apache-2.0' },
			{ name: 'swiper', license: 'MIT' }
		]);
	});

	it('preserves compound SPDX license strings', () => {
		const deps: BundledLicenseInfo[] = [
			{ name: 'posthog-js', version: '1.0.0', license: '(Apache-2.0 AND MIT)' }
		];

		expect(formatThirdPartyLicenses(deps)).toEqual([
			{ name: 'posthog-js', license: '(Apache-2.0 AND MIT)' }
		]);
	});

	it('uses UNKNOWN when license is empty', () => {
		expect(
			formatThirdPartyLicenses([{ name: 'mystery', version: '1.0.0', license: '  ' }])
		).toEqual([{ name: 'mystery', license: 'UNKNOWN' }]);
	});

	it('writes formatted JSON to disk', () => {
		outputDir = mkdtempSync(join(tmpdir(), 'chronos-third-party-licenses-'));
		const outputPath = join(outputDir, 'third-party.json');

		writeGeneratedThirdPartyLicenses(outputPath, [
			{ name: 'marked', version: '18.0.0', license: 'MIT' }
		]);

		expect(JSON.parse(readFileSync(outputPath, 'utf8'))).toEqual([
			{ name: 'marked', license: 'MIT' }
		]);
	});
});

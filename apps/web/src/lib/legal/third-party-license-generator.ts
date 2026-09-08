import { writeIfChanged } from '../build-utils/write-if-changed';

export interface ThirdPartyLicense {
	name: string;
	license: string;
}

export interface BundledLicenseInfo {
	name: string;
	version: string;
	license: string;
	licenseText?: string;
}

export function formatThirdPartyLicenses(deps: BundledLicenseInfo[]): ThirdPartyLicense[] {
	const byName = new Map<string, string>();

	for (const dep of deps) {
		if (dep.name.startsWith('@chronos/')) continue;
		if (byName.has(dep.name)) continue;
		const license = dep.license.trim();
		byName.set(dep.name, license || 'UNKNOWN');
	}

	return [...byName.entries()]
		.map(([name, license]) => ({ name, license }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function writeGeneratedThirdPartyLicenses(
	outputPath: string,
	deps: BundledLicenseInfo[]
): string {
	const json = JSON.stringify(formatThirdPartyLicenses(deps), null, '\t') + '\n';
	writeIfChanged(outputPath, json);
	return outputPath;
}

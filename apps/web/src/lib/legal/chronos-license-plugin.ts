import { resolve } from 'node:path';
import { licensePlugin } from 'rolldown-license-plugin';
import type { Plugin } from 'vite';
import { writeGeneratedThirdPartyLicenses } from './third-party-license-generator';

export function chronosLicensePlugin(webRoot: string): Plugin {
	const outputPath = resolve(webRoot, 'static/licenses/third-party.json');

	return {
		name: 'chronos-third-party-licenses',
		apply: 'build',
		configEnvironment(name) {
			if (name !== 'client') return;
			return {
				build: {
					rolldownOptions: {
						plugins: [
							licensePlugin({
								done(deps) {
									writeGeneratedThirdPartyLicenses(outputPath, deps);
								}
							})
						]
					}
				}
			};
		}
	};
}

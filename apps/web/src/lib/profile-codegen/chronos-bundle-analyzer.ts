import type { Plugin } from 'vite';
import { bundleAnalyzerPlugin } from 'vite/rolldown/experimental';

export function chronosBundleAnalyzer(enabled: boolean): Plugin {
	return {
		name: 'chronos-bundle-analyzer',
		apply: 'build',
		configEnvironment(name) {
			if (!enabled || name !== 'client') return;
			return {
				build: {
					rolldownOptions: {
						plugins: [
							bundleAnalyzerPlugin({
								fileName: 'analyze-data.json',
								format: 'json'
							})
						]
					}
				}
			};
		}
	};
}

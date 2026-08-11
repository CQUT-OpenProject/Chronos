export function initWebVitals() {
	if (import.meta.env.DEV) return;

	void import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
		onCLS((metric) => console.info('[vitals]', metric.name, metric.value));
		onINP((metric) => console.info('[vitals]', metric.name, metric.value));
		onLCP((metric) => console.info('[vitals]', metric.name, metric.value));
	});
}

/** Injects and tracks per-plugin `<style>` elements in the document head. */
export class PluginCssInjector {
	private readonly styleElements = new Map<string, HTMLStyleElement>();

	inject(pluginId: string, css: string): void {
		if (typeof document === 'undefined') return;
		this.remove(pluginId);
		const el = document.createElement('style');
		el.setAttribute('data-plugin-id', pluginId);
		el.textContent = css;
		document.head.appendChild(el);
		this.styleElements.set(pluginId, el);
	}

	remove(pluginId: string): void {
		const el = this.styleElements.get(pluginId);
		if (el) {
			el.remove();
			this.styleElements.delete(pluginId);
		} else if (typeof document !== 'undefined') {
			const fallback = document.querySelector(`style[data-plugin-id="${pluginId}"]`);
			fallback?.remove();
		}
	}

	disposeAll(): void {
		for (const [, el] of this.styleElements) {
			el.remove();
		}
		this.styleElements.clear();
	}
}

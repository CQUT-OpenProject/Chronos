const WHITESPACE_REGEX = /\s+/g;

export function normalizeWhitespace(value: string): string {
	return value.trim().replace(WHITESPACE_REGEX, ' ');
}

export function parseHtmlDoc(html: string): Document {
	if (typeof DOMParser !== 'undefined') {
		return new DOMParser().parseFromString(html, 'text/html');
	}
	throw new Error('DOMParser is not available in current runtime');
}

export function extractOwnText(element: Element | null | undefined): string {
	if (!element) return '';
	let text = '';
	for (let i = 0; i < element.childNodes.length; i += 1) {
		const node = element.childNodes[i]!;
		if (node.nodeType === 3 /* Node.TEXT_NODE */) {
			text += node.textContent ?? '';
		}
	}
	return text;
}

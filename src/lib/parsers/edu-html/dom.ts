export function parseHtmlDocument(html: string): Document {
	return new DOMParser().parseFromString(html, 'text/html');
}

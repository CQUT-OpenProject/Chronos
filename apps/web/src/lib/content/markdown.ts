import { marked, Renderer } from 'marked';

function createExternalLinkRenderer(): Renderer {
	const renderer = new Renderer();
	renderer.link = ({ href, title, text }) => {
		const titleAttr = title ? ` title="${title}"` : '';
		return `<a href="${href}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`;
	};
	return renderer;
}

const externalLinkRenderer = createExternalLinkRenderer();

export function parseMarkdown(markdown: string): string {
	return marked.parse(markdown, { renderer: externalLinkRenderer, async: false }) as string;
}

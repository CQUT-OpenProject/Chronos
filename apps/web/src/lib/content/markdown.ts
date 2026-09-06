import type { Renderer } from 'marked';

function createExternalLinkRenderer(RendererCtor: typeof Renderer): Renderer {
	const renderer = new RendererCtor();
	renderer.link = ({ href, title, text }) => {
		const titleAttr = title ? ` title="${title}"` : '';
		return `<a href="${href}"${titleAttr} target="_blank" rel="noreferrer">${text}</a>`;
	};
	return renderer;
}

let markedModulePromise: Promise<typeof import('marked')> | null = null;

function loadMarked() {
	markedModulePromise ??= import('marked');
	return markedModulePromise;
}

export async function parseMarkdown(markdown: string): Promise<string> {
	const { marked, Renderer: RendererCtor } = await loadMarked();
	const renderer = createExternalLinkRenderer(RendererCtor);
	return marked.parse(markdown, { renderer, async: false }) as string;
}

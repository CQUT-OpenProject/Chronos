const HIDE_DELAY_MS = 900;
const MIN_THUMB_PX = 24;

const HOST_LAYOUT_CLASSES = new Set([
	'flex-1',
	'min-h-0',
	'h-full',
	'w-full',
	'mx-auto',
	'grow',
	'shrink-0'
]);

function shouldMigrateLayoutClass(className: string): boolean {
	if (HOST_LAYOUT_CLASSES.has(className)) return true;
	return className.startsWith('max-w-');
}

export function splitScrollLayoutClasses(classNames: Iterable<string>): {
	hostClasses: string[];
	scrollClasses: string[];
} {
	const hostClasses: string[] = [];
	const scrollClasses: string[] = [];

	for (const className of classNames) {
		if (shouldMigrateLayoutClass(className)) {
			hostClasses.push(className);
		} else {
			scrollClasses.push(className);
		}
	}

	return { hostClasses, scrollClasses };
}

export interface ScrollThumbMetrics {
	visible: boolean;
	height: number;
	offset: number;
}

export function computeScrollThumbMetrics(
	scrollTop: number,
	scrollHeight: number,
	clientHeight: number,
	minThumbPx = MIN_THUMB_PX
): ScrollThumbMetrics {
	if (scrollHeight <= clientHeight + 1) {
		return { visible: false, height: 0, offset: 0 };
	}

	const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, minThumbPx);
	const maxOffset = clientHeight - thumbHeight;
	const scrollable = scrollHeight - clientHeight;
	const offset = scrollable > 0 ? (scrollTop / scrollable) * maxOffset : 0;

	return { visible: true, height: thumbHeight, offset };
}

function applyThumbMetrics(thumb: HTMLElement, metrics: ScrollThumbMetrics): void {
	if (!metrics.visible) {
		thumb.style.display = 'none';
		return;
	}

	thumb.style.display = '';
	thumb.style.height = `${metrics.height}px`;
	thumb.style.transform = `translateY(${metrics.offset}px)`;
}

/** Reveals a custom overlay thumb while the element is scrolling, then hides it again. */
export function scrollRevealScrollbar(node: HTMLElement) {
	const parent = node.parentNode;
	if (!parent) {
		return { destroy() {} };
	}

	const host = document.createElement('div');
	host.className = 'secondary-scroll-host';

	const { hostClasses: migratedClasses, scrollClasses } = splitScrollLayoutClasses(node.classList);
	node.className = scrollClasses.join(' ');
	host.classList.add(...migratedClasses);

	const thumb = document.createElement('div');
	thumb.className = 'secondary-scroll-thumb';
	thumb.setAttribute('aria-hidden', 'true');

	parent.insertBefore(host, node);
	host.appendChild(node);
	host.appendChild(thumb);

	let addedFillClasses = false;
	if (!node.classList.contains('h-full')) {
		node.classList.add('h-full', 'w-full');
		addedFillClasses = true;
	}

	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	const updateThumb = () => {
		applyThumbMetrics(
			thumb,
			computeScrollThumbMetrics(node.scrollTop, node.scrollHeight, node.clientHeight)
		);
	};

	const reveal = () => {
		host.classList.add('is-scrolling');
		updateThumb();
		if (hideTimer !== undefined) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			host.classList.remove('is-scrolling');
			hideTimer = undefined;
		}, HIDE_DELAY_MS);
	};

	node.addEventListener('scroll', reveal, { passive: true });
	const resizeObserver = new ResizeObserver(() => updateThumb());
	resizeObserver.observe(node);
	updateThumb();

	return {
		destroy() {
			node.removeEventListener('scroll', reveal);
			resizeObserver.disconnect();
			if (hideTimer !== undefined) clearTimeout(hideTimer);
			host.classList.remove('is-scrolling');

			if (host.isConnected) {
				if (parent.isConnected) {
					parent.insertBefore(node, host);
				}
				host.remove();
			}

			for (const className of migratedClasses) {
				node.classList.add(className);
			}
			if (addedFillClasses) {
				node.classList.remove('h-full', 'w-full');
			}
		}
	};
}

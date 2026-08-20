import type { TransitionConfig } from 'svelte/transition';
import { getTransitionDirection, type NavigationDirection } from './navigation-direction';

const SECONDARY_PAGE_DURATION_MS = 300;

type SecondaryPageTransitionParams = {
	phase?: 'in' | 'out';
	direction?: NavigationDirection;
};

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * MD3 规范三次贝塞尔缓动函数生成器
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	return function (t: number): number {
		if (t <= 0) return 0;
		if (t >= 1) return 1;
		let u = t;
		for (let i = 0; i < 5; i++) {
			const currentX = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
			const currentDx =
				3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
			if (Math.abs(currentDx) < 1e-6) break;
			u = u - (currentX - t) / currentDx;
		}
		return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
	};
}

// MD3 Emphasized 缓动曲线
const md3EmphasizedDecelerate = cubicBezier(0.05, 0.7, 0.1, 1.0);
const md3EmphasizedAccelerate = cubicBezier(0.3, 0.0, 0.8, 0.15);

export function secondaryPageTransition(
	node: Element,
	{ phase = 'in', direction: directionParam }: SecondaryPageTransitionParams = {}
): TransitionConfig {
	const direction = directionParam ?? getTransitionDirection();
	if (direction === 'none') {
		return { duration: 0 };
	}

	const width = node.getBoundingClientRect().width;
	const duration = SECONDARY_PAGE_DURATION_MS;
	const easing = phase === 'in' ? md3EmphasizedDecelerate : md3EmphasizedAccelerate;
	// 上层页面：forward 进入或 back 退出时滑入/滑出
	const topPage = direction === 'forward' ? phase === 'in' : phase === 'out';

	return {
		duration: prefersReducedMotion() ? 1 : duration,
		easing,
		css: (t) => {
			if (topPage) {
				const x = (1 - t) * width;
				const radius = (1 - t) * 24;
				const shadowAlpha = 0.15 * t;
				return `
					z-index: 20;
					transform: translateX(${x}px);
					border-radius: ${radius}px;
					box-shadow: -8px 0 24px rgba(0, 0, 0, ${shadowAlpha});
					opacity: 1;
				`;
			}
			// 底层页面视差收缩/还原
			const x = -(1 - t) * width * 0.25;
			const scale = 0.93 + t * 0.07;
			const opacity = 0.85 + t * 0.15;
			return `
				z-index: 10;
				transform: translateX(${x}px) scale(${scale});
				opacity: ${opacity};
			`;
		}
	};
}

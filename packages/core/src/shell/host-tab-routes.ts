/** Host SvelteKit tab pages; must match apps/web/src/routes/(tabs)/* */
export const HOST_SHELL_TAB_ROUTES = ['/', '/today', '/mine'] as const;

export type HostShellTabRoute = (typeof HOST_SHELL_TAB_ROUTES)[number];

export function isHostShellTabRoute(href: string): href is HostShellTabRoute {
	return (HOST_SHELL_TAB_ROUTES as readonly string[]).includes(href);
}

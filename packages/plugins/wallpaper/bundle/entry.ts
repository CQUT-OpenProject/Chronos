import { mount, unmount } from 'svelte';
import { createWallpaperPlugin } from '../src/create-wallpaper-plugin.ts';
import WallpaperScreen from '../src/WallpaperScreen.svelte';

export default createWallpaperPlugin({
	screenComponent: {
		mount(target: HTMLElement, props: Record<string, unknown>) {
			const instance = mount(WallpaperScreen, {
				target,
				props: props as never
			});
			return {
				unmount() {
					void unmount(instance);
				}
			};
		}
	}
});

import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createTodayPlugin } from '../src/index.ts';
import TodayScreen from '../src/TodayScreen.svelte';

export default createTodayPlugin({
	screenComponent: mountableSvelteComponent(TodayScreen)
});

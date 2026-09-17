import './styles.css';
import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createClockPlugin } from '../src/index.ts';
import ClockScreen from '../src/ClockScreen.svelte';

export default createClockPlugin({
	screenComponent: mountableSvelteComponent(ClockScreen)
});

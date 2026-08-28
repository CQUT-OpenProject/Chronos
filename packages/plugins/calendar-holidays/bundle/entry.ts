import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createHolidayPlugin } from '../src/index.ts';
import HolidayCalendarScreen from '../src/HolidayCalendarScreen.svelte';

export default createHolidayPlugin({
	screenComponent: mountableSvelteComponent(HolidayCalendarScreen)
});

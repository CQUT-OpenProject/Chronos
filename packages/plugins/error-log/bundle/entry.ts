import './styles.css';
import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createErrorLogPlugin } from '../src/index.ts';
import ErrorLogScreen from '../src/ErrorLogScreen.svelte';

export default createErrorLogPlugin({
	screenComponent: mountableSvelteComponent(ErrorLogScreen)
});

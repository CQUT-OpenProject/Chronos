import type { ChronosContext } from '../types/context';
import type { ImportTabSlotContribution } from '../types/slots';

export function registerImportTab<FormState extends object>(
	ctx: ChronosContext,
	contribution: ImportTabSlotContribution<FormState> & { id: string }
) {
	return ctx.registerSlot('import.source.tab', contribution);
}

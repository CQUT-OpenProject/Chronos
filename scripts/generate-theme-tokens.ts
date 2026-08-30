import { writeGeneratedThemeCss } from '../apps/web/src/lib/theme/theme.ts';

const outputPath = writeGeneratedThemeCss();
console.log(`Wrote ${outputPath}`);

import { writeGeneratedThemeCss } from '../apps/web/src/lib/m3/theme.ts';

const outputPath = writeGeneratedThemeCss();
console.log(`Wrote ${outputPath}`);

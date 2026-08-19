import type { ChronosPlugin } from '@chronos/core';
import { cqutPlugin } from './source-cqut/index';
import { htmlParserPlugin } from './parser-html/index';
import { shareCodecPlugin } from './codec-share/index';

export * from './source-cqut/index';
export * from './parser-html/index';
export * from './codec-share/index';

export const builtinPlugins: ChronosPlugin[] = [cqutPlugin, htmlParserPlugin, shareCodecPlugin];

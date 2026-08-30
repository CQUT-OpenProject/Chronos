# ADR 0029: Design Token Layering and Naming

- **Status**: Accepted
- **Date**: 2026-08-29
- **Scope**: `packages/ui-kit/src/theme`, `apps/web/src/lib/theme`, `packages/core/src/theme/workbench-colors.ts`

## Context

Style tokens were scattered across `generated-theme.css`, `layout.css` `@layer tokens`, `m3.css`, and runtime `workbenchColors`. Host color overrides duplicated M3 output; `m3-*` class names implied MD3 compliance though UI was customized.

## Decision

1. **Single host color source** — `CHRONOS_HOST_COLORS` merged into `buildGeneratedThemeCss()`; removed duplicate hex from `layout.css`.
2. **Directory** — `apps/web/src/lib/m3/` replaced by `apps/web/src/lib/theme/` (`generated-colors`, `typography`, `radius`, `layout-tokens`, `ui-patterns`).
3. **Naming** — Typography: `text-*`; component patterns: `ui-*`; shell top bar: `ui-shell-top-bar`. Legacy `m3-*` aliases retained temporarily.
4. **Workbench registry** — Extended with host semantic keys (`color.canvas`, `color.ink`, etc.).

## Consequences

- `m3-default` theme still skips inline CSS application; generated CSS must match `workbenchColors`.
- Plugin themes may omit new workbench keys; CSS defaults apply.
- See `docs/design-tokens.md` for maintainer guide.

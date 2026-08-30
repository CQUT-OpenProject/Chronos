# Chronos Design Tokens

## Architecture

1. **Static layer (build time)** — `packages/ui-kit/src/theme/m3-theme.ts` generates Material colors; `CHRONOS_HOST_COLORS` overrides host semantics; `theme/generated-colors.css` is the CSS output.
2. **Tailwind bridge** — `@theme` / `@theme inline` in `generated-colors.css`, `typography.css`, `radius.css`.
3. **Runtime layer** — plugin themes via `WORKBENCH_COLOR_REGISTRY` + `applyActiveTheme` (closed keys only).
4. **Consumption** — `text-*` typography, `ui-*` component patterns, Tailwind utilities (`bg-surface`, `rounded-dialog`).

## Where to change what

| Change                                     | Location                                                           |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Host canvas/surface/outline/success colors | `CHRONOS_HOST_COLORS` in `packages/ui-kit/src/theme/m3-theme.ts`   |
| Material brand seed / algorithm            | `BRAND_SOURCE_ARGB`, `m3-theme.ts`                                 |
| Typography scale                           | `typography-tokens.ts` + `apps/web/src/lib/theme/typography.css`   |
| Radius / squircle                          | `radius-tokens.ts` + `apps/web/src/lib/theme/radius.css`           |
| Form fields, section surfaces              | `apps/web/src/lib/theme/ui-patterns.css`                           |
| Shell bar height / safe area               | `apps/web/src/lib/theme/layout-tokens.css`                         |
| Plugin theme colors                        | Official `colors.json` or plugin `workbenchColors` (registry keys) |

Regenerate CSS after token changes:

```bash
node --experimental-strip-types scripts/generate-theme-tokens.ts
```

## Workbench color keys

See `WORKBENCH_COLOR_KEYS` in `packages/core/src/theme/workbench-colors.ts`. Host semantics: `color.canvas`, `color.ink`, `color.border-subtle`, `color.success`, `color.warning`, `color.danger`, `color.outline-variant`, `color.surface-container-high`.

## Class name migration

| Legacy               | Current                |
| -------------------- | ---------------------- |
| `m3-headline-medium` | `text-headline-medium` |
| `m3-body-large`      | `text-body-large`      |
| `m3-form-field`      | `ui-form-field`        |
| `m3-section-surface` | `ui-section-surface`   |
| `m3-top-app-bar`     | `ui-shell-top-bar`     |

Legacy `m3-*` aliases remain in `typography.css` and `ui-patterns.css` for one release cycle.

## Radius tokens

| CSS variable                 | Value      | Use                     |
| ---------------------------- | ---------- | ----------------------- |
| `--radius-section-surface`   | `1.5rem`   | Grouped list cards      |
| `--radius-section-item`      | `1.125rem` | List item press overlay |
| `--squircle-compensation-ui` | `1.65`     | General UI squircles    |
| `--squircle-compensation`    | `1.72`     | Timetable capsules only |

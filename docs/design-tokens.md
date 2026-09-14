# Chronos Design Tokens

## Architecture

1. **Static layer (build time)** — `packages/ui-kit/src/theme/m3-theme.ts` generates Material colors; `CHRONOS_HOST_COLORS` overrides host semantics; `theme/generated-colors.css` is the CSS output.
2. **Tailwind bridge** — `@theme` / `@theme inline` in `generated-colors.css`, `typography.css`, and `packages/ui-kit/src/theme/radius.css`. Official plugins reuse the generated `@theme inline` via `theme-inline.generated.css`.
3. **Runtime layer** — plugin themes via `WORKBENCH_COLOR_REGISTRY` + `applyActiveTheme` (closed keys only).
4. **Consumption** — `text-*` typography, `ui-*` component patterns, Tailwind utilities (`bg-surface`, `rounded-dialog`).

## Where to change what

| Change                                     | Location                                                           |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Host canvas/surface/outline/success colors | `CHRONOS_HOST_COLORS` in `packages/ui-kit/src/theme/m3-theme.ts`   |
| Material brand seed / algorithm            | `BRAND_SOURCE_ARGB`, `m3-theme.ts`                                 |
| Typography scale                           | `typography-tokens.ts` + `apps/web/src/lib/theme/typography.css`   |
| Radius                                     | `radius-tokens.ts` + `packages/ui-kit/src/theme/radius.css`        |
| Elevation / shadow scale                   | `apps/web/src/lib/theme/elevation-tokens.css`                      |
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

Legacy `m3-*` aliases have been completely removed.

## Elevation

Each surface uses **one** depth cue. Do not combine `border` with generic Tailwind shadows (`shadow-xs`, `shadow-md`, etc.) on the same element.

| Level      | Semantic         | Implementation                                             | Use                                                        |
| ---------- | ---------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `outlined` | Flat stroke      | `border` only                                              | Inputs, outlined `Card`, segmented track, selected options |
| `raised`   | Grouped content  | `ui-section-surface` (`border-subtle` + `--shadow-raised`) | List groups, content cards                                 |
| `floating` | Transient toast  | `shadow-floating` only                                     | Snackbar, tooltips                                         |
| `overlay`  | Modal layer      | `shadow-overlay` only (no border)                          | Dialog, BottomSheet, DatePicker                            |
| `inset`    | Recessed         | `shadow-inner`                                             | Drag placeholders                                          |
| `control`  | Thumb affordance | `shadow-control`                                           | Switch / Slider thumbs                                     |

Patterns in `ui-patterns.css`:

- `ui-section-surface` — default compact padding (`0.375rem`) for list groups (Mine, Plugins).
- `ui-section-surface--comfortable` — `1rem` padding for forms and plugin content panels.
- `ui-section-stack` — inner `flex` column with `gap: 1rem` for comfortable panels (title + form + CTA). Do not put `gap-*` on `ui-section-surface` itself; use this wrapper instead.
- `ui-segmented-track` / `ui-segmented-thumb` — segmented control; track is outlined, thumb has no shadow.
- `ui-btn` / `ui-btn-filled` / `ui-btn-outlined` / `ui-btn-text` / `ui-btn-block` — shared CTA patterns for plugins and host. Host `Button.svelte` composes these classes; plugins use the CSS classes directly.

Rules:

- Inputs and buttons: no elevation shadow (including `hover:shadow-*`).
- Do not nest two raised surfaces with outer shadows.
- Plugins rely on host-provided `ui-*` classes; do not hand-roll `border + shadow-xs` cards.

## Radius tokens

Chronos uses standard CSS `border-radius` only (no `corner-shape` / squircle). Tailwind `rounded-*` scales and semantic tokens are defined in `radius.css` `@theme`. Plugins should use host semantic classes such as `rounded-dialog` and `rounded-t-sheet` when needed.

| CSS variable               | Value      | Use                       |
| -------------------------- | ---------- | ------------------------- |
| `--radius-lg`              | `0.5rem`   | Tailwind `rounded-lg`     |
| `--radius-xl`              | `0.75rem`  | Tailwind `rounded-xl`     |
| `--radius-2xl`             | `1rem`     | Tailwind `rounded-2xl`    |
| `--radius-3xl`             | `1.5rem`   | Tailwind `rounded-3xl`    |
| `--radius-dialog`          | `28px`     | Dialog surfaces           |
| `--radius-sheet-top`       | `28px`     | Bottom sheet top corners  |
| `--radius-section-surface` | `1.25rem`  | Grouped list cards        |
| `--radius-section-item`    | `0.75rem`  | List item press overlay   |
| `--radius-leading-icon`    | `0.875rem` | Leading icon chips        |
| `--radius-capsule`         | `0.75rem`  | Timetable course capsules |

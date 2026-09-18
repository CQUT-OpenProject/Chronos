---
name: svelte-code-writer
description: Use the Svelte documentation and autofixer CLI when Svelte assistance is needed and MCP tools are unavailable.
---

## CLI tools

You have access to `@sveltejs/mcp` CLI for Svelte-specific assistance. Use these commands via `vpx` (never `npx`; `vpx` is the only allowed runner):

### List documentation sections

```bash
vpx @sveltejs/mcp list-sections
```

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths.

### Get documentation

```bash
vpx @sveltejs/mcp get-documentation "<section1>,<section2>,..."
```

Retrieves full documentation for specified sections. Use `list-sections` first only when the relevant section is not already known.

**Example:**

```bash
vpx @sveltejs/mcp get-documentation "$state,$derived,$effect"
```

### Svelte autofixer

```bash
vpx @sveltejs/mcp svelte-autofixer "<code_or_path>" [options]
```

Analyzes Svelte code and suggests fixes for common issues.

**Options:**

- `--async` - Enable async Svelte mode (default: false)
- `--svelte-version` - Target version: 4 or 5 (default: 5)

**Examples:**

```bash
# Analyze inline code (escape $ as \$)
vpx @sveltejs/mcp svelte-autofixer '<script>let count = \$state(0);</script>'

# Analyze a file
vpx @sveltejs/mcp svelte-autofixer ./src/lib/Component.svelte

# Target Svelte 4
vpx @sveltejs/mcp svelte-autofixer ./Component.svelte --svelte-version 4
```

**Important:** When passing code with runes (`$state`, `$derived`, etc.) via the terminal, escape the `$` character as `\$` to prevent shell variable substitution.

## Workflow

1. **Uncertain about syntax, APIs, or version behavior?** Fetch relevant topics with `get-documentation`; use `list-sections` only when the section is unknown.
2. **Reviewing/debugging?** Use `svelte-autofixer` when it can help investigate a concrete Svelte concern.
3. **Validate logic changes** - Run `svelte-autofixer` before finalizing Svelte logic changes; typo/format-only edits may skip. Reuse the result for unchanged code. Retry a plausibly transient failure once; if clearly unavailable, note the limitation and continue other validation. Fix clear true-positives relevant to the change and re-validate at most twice; do not loop on disputed style hints.

Final project validation follows [AGENTS.md](../../../AGENTS.md).

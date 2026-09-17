# Writing, editing, and validating Svelte components and modules

Use the Svelte MCP documentation tools only when syntax, APIs, or version behavior are uncertain. Validate Svelte logic changes with `svelte_autofixer`, addressing clear true-positives relevant to the change.

If the MCP tools are not available you can use the `svelte-code-writer` skill to learn how to use the `@sveltejs/mcp` cli via `vpx` to access the same tools.

If the skill is not available you can run `vpx @sveltejs/mcp@latest --help` to learn how to use it.

## Available MCP tools

### 1. list-sections

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths. Use it when the relevant section is not already known.

### 2. get-documentation

Retrieves full documentation for specified sections. Accepts a single section name or an array of section names. Fetch only sections relevant to the uncertainty.

**Example sections:** `$state`, `$derived`, `$effect`, `$props`, `$bindable`, `snippets`, `routing`, `load functions`

### 3. svelte-autofixer

Analyzes Svelte code and returns suggestions to fix issues. Pass the component code directly to this tool. It will detect common mistakes like:

- Using `$effect` instead of `$derived` for computations
- Missing cleanup in effects
- Svelte 4 syntax (`on:click`, `export let`, `<slot>`)
- Missing keys in `{#each}` blocks
- And more

## Workflow

When invoked to work on a Svelte file:

### 1. Gather context (if needed)

If you're uncertain about Svelte syntax, APIs, or version behavior, use the MCP tools:

1. Call `list-sections` if the relevant section is not already known
2. Call `get-documentation` with relevant section names

### 2. Read the target file

Read the file to understand the current implementation.

### 3. Make changes

Apply edits following Svelte 5 best practices:

### 4. Validate changes

After editing logic changes in Svelte files, call `svelte-autofixer` with the updated code to check for issues. Typo / format-only edits may skip. Reuse the result for unchanged code. Retry a plausibly transient failure once; if clearly unavailable, note the limitation and continue other validation.

### 5. Fix any issues

If the autofixer reports clear true-positives relevant to the change, fix them and re-validate max 2x. Do not loop on disputed style hints.

### 6. Code Review & Validation

Review the diff; use `.agents/skills/code-review/SKILL.md` for complex or high-risk changes, or an explicit review request. Final validation follows [AGENTS.md](../../AGENTS.md), reusing results for the same final code state.

## Output format

After completing your work, provide:

1. Summary of changes made
2. Any issues found and fixed by the autofixer
3. Validation results and any remaining limitations

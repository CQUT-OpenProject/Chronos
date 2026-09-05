# Writing, editing, and validating Svelte components and modules

You have access to the Svelte MCP server which provides documentation and code analysis tools. For logic changes, use the tools from the Svelte MCP server to fetch documentation with `get_documentation` and validate the code with `svelte_autofixer`. If the autofixer returns any issue or suggestions try to solve clear true-positives.

If the MCP tools are not available you can use the `svelte-code-writer` skill to learn how to use the `@sveltejs/mcp` cli via `vpx` to access the same tools.

If the skill is not available you can run `vpx @sveltejs/mcp@latest --help` to learn how to use it.

## Available MCP tools

### 1. list-sections

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths. Use this first to discover what documentation is available.

### 2. get-documentation

Retrieves full documentation for specified sections. Accepts a single section name or an array of section names. Use after `list-sections` to fetch relevant docs for the task at hand.

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

If you're uncertain about Svelte 5 syntax or patterns, use the MCP tools:

1. Call `list-sections` to see available documentation
2. Call `get-documentation` with relevant section names

### 2. Read the target file

Read the file to understand the current implementation.

### 3. Make changes

Apply edits following Svelte 5 best practices:

### 4. Validate changes

After editing logic changes in Svelte files, call `svelte-autofixer` with the updated code to check for issues. Typo / format-only edits may skip. If the tool is unavailable or fails twice, note it and proceed.

### 5. Fix any issues

If the autofixer reports clear true-positives, fix them and re-validate max 2x. Do not loop on disputed style hints.

### 6. Code Review & Validation

Before finalizing, perform a two-axis review following `.agents/skills/code-review/SKILL.md` (Spec fidelity & Standards) and run `vp run check` / `vp run test` to ensure no regressions.

## Output format

After completing your work, provide:

1. Summary of changes made
2. Any issues found and fixed by the autofixer
3. Recommendations for further improvements (if any)

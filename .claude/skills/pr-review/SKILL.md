---
name: pr-review
description: Review all local branch changes against main for bugs, type issues, and project-specific concerns
---

# PR Review

Review all local changes on the current branch against main.

## Steps

1. Get the diff: !`git diff main`
2. Get the list of changed files: !`git diff main --name-only`
3. Review the diff and report findings grouped by file.

## What to check

- Logic bugs or off-by-one errors
- Missing loading/error states on async operations
- Any direct DB writes or reads happening outside of `app/api/`
- Type safety issues (unsafe casts, missing null checks)
- Unintended side effects in React providers or context updates
- Anything that could corrupt the block/week/day/exercise nested data structure

## Output format

For each file with findings, list them as:

**filename**
- [severity: low/medium/high] description of issue, with the relevant line or function name

If there are no issues in a file, skip it. End with a one-line overall summary.

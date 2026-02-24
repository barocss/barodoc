---
"barodoc": minor
---

Auto-update Quick Mode dependencies when CLI version changes

- Track CLI version in `.barodoc/.cli-version` marker file
- Automatically reinstall dependencies when a new CLI version is detected
- Pin `@barodoc/core` and `@barodoc/theme-docs` to the current major version instead of hardcoded `^1.0.0`

# AI Assistant Setup (ECC + Cursor)

This project can use **[Everything Claude Code](https://github.com/affaan-m/everything-claude-code)** (ECC) together with **Cursor**, so you get ECC’s rules, skills, hooks, and commands while keeping Barodoc-specific rules and skills.

## What you get

- **ECC**: coding rules (common + TypeScript), skills (TDD, code review, security, etc.), hooks, agents, and slash commands.
- **Barodoc**: existing `.cursor/rules/*.mdc` and `.cursor/skills/barodoc-*` (config, docs, components, plugins, i18n, CLI, overview).

Both live in `.cursor/`; the install script merges them.

## One-time setup (Cursor)

From the repo root:

```bash
./scripts/setup-ecc-cursor.sh
```

Default language is **typescript**. To add more (e.g. Python, Go):

```bash
./scripts/setup-ecc-cursor.sh typescript python golang
```

The script will:

1. Back up existing `.cursor/rules` and `.cursor/skills`
2. Clone ECC and run its Cursor installer (`--target cursor`)
3. Restore Barodoc rules (`.mdc`) and Barodoc skills (`barodoc-*`) so they are not overwritten

After that, Cursor will use both ECC and Barodoc config from `.cursor/`.

## Optional: Claude Code

If you use **Claude Code** (CLI) as well, you can install ECC rules into `~/.claude/rules/`:

```bash
git clone --depth 1 https://github.com/affaan-m/everything-claude-code.git /tmp/ecc
/tmp/ecc/install.sh typescript   # or: typescript python golang
```

That only installs rules; agents/skills/commands are in the repo. See [ECC README](https://github.com/affaan-m/everything-claude-code#installation) for full options.

## References

- [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) — rules, skills, hooks, agents, commands.
- [ECC Cursor support](https://github.com/affaan-m/everything-claude-code#cursor-ide-support) — hook events, rules format, install.
- Barodoc AI reference: root [AGENTS.md](../AGENTS.md) and [DEVELOPMENT.md](../DEVELOPMENT.md).

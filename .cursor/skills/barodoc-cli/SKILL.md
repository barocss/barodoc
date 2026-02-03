---
name: barodoc-cli
description: Barodoc CLI commands for development, building, and project creation. Use when running barodoc commands, setting up dev servers, building documentation sites, or creating new projects.
---

# Barodoc CLI

The `barodoc` CLI provides commands for development, building, and project management.

## Installation

```bash
# Global install
npm install -g barodoc

# Or use via npx
npx barodoc serve
```

## Commands

### serve - Development Server

Start a development server with hot reload.

```bash
barodoc serve [dir] [options]
```

**Arguments:**
- `dir` - Project directory (default: `.`)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to listen on | 4321 |
| `-h, --host` | Expose to network | false |
| `-c, --config <file>` | Config file path | auto-detect |

**Examples:**

```bash
# Current directory
barodoc serve

# Specific directory
barodoc serve docs

# Custom port
barodoc serve --port 3000

# Expose to network
barodoc serve --host
```

### build - Production Build

Build static files for deployment.

```bash
barodoc build [dir] [options]
```

**Arguments:**
- `dir` - Project directory (default: `.`)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Output directory | dist |
| `-c, --config <file>` | Config file path | auto-detect |

**Examples:**

```bash
# Build current directory
barodoc build

# Build specific directory
barodoc build docs

# Custom output
barodoc build --output build
```

**Output:**
- Static HTML/CSS/JS in output directory
- Pagefind search index generated automatically

### preview - Preview Build

Serve the production build locally for testing.

```bash
barodoc preview [dir] [options]
```

**Arguments:**
- `dir` - Project directory (default: `.`)

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `-p, --port <port>` | Port to listen on | 4321 |
| `-o, --output <dir>` | Build output directory | dist |

**Example:**

```bash
barodoc build && barodoc preview
```

### create - New Project

Scaffold a new Barodoc documentation project.

```bash
barodoc create <name>
```

**Arguments:**
- `name` - Project name (creates directory)

**Example:**

```bash
barodoc create my-docs
cd my-docs
barodoc serve
```

**Generated structure:**

```
my-docs/
├── barodoc.config.json
├── docs/
│   └── en/
│       ├── introduction.md
│       └── quickstart.md
├── public/
│   └── logo.svg
└── .gitignore
```

## Auto-Detection

The CLI automatically detects project type:

| File Present | Mode | Behavior |
|--------------|------|----------|
| `astro.config.mjs` | Full Custom | Runs `astro dev/build` directly |
| No astro config | Quick Mode | Creates temp Astro project in `.barodoc/` |

## Development Workflow

### In Monorepo (Local Development)

```bash
# Run CLI with tsx (no build required)
pnpm barodoc serve docs

# With explicit path
pnpm barodoc build docs --output docs/dist
```

The monorepo root `package.json` has:

```json
{
  "scripts": {
    "barodoc": "tsx packages/barodoc/src/cli.ts"
  }
}
```

### Published Package

```bash
# After npm install -g barodoc
barodoc serve
barodoc build
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (config not found, build failed, etc.) |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Default port (overridden by --port) |
| `HOST` | Default host binding |

## Troubleshooting

### "Config file not found"

Ensure `barodoc.config.json` exists in the target directory:

```bash
# Check current directory
ls barodoc.config.json

# Or specify explicitly
barodoc serve --config ./my-config.json
```

### Port already in use

```bash
barodoc serve --port 4322
```

### Build fails with missing dependencies

For Quick Mode, ensure you have Node.js 20+ installed. For Full Custom Mode, run:

```bash
pnpm install  # or npm install
```

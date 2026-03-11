#!/usr/bin/env bash
# setup-ecc-cursor.sh — Install Everything Claude Code (ECC) for Cursor into this repo,
# then restore Barodoc-specific rules and skills so both ECC and Barodoc AI configs coexist.
#
# Usage: from repo root
#   ./scripts/setup-ecc-cursor.sh [typescript|python|golang|...]
#
# Default: typescript (recommended for this repo).
# See https://github.com/affaan-m/everything-claude-code

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

LANGS="${*:-typescript}"
ECC_REPO="${ECC_REPO:-https://github.com/affaan-m/everything-claude-code.git}"
TEMP_DIR="${TMPDIR:-/tmp}/ecc-barodoc-$$"

echo "Installing ECC for Cursor (languages: $LANGS) into $REPO_ROOT/.cursor"
echo ""

# Backup Barodoc .cursor rules and skills (we'll restore after ECC install)
BACKUP="$REPO_ROOT/.cursor.ecc-backup"
mkdir -p "$REPO_ROOT/.cursor"
if [[ -d "$REPO_ROOT/.cursor/rules" ]] || [[ -d "$REPO_ROOT/.cursor/skills" ]]; then
  echo "Backing up existing .cursor/rules and .cursor/skills to $BACKUP"
  rm -rf "$BACKUP"
  mkdir -p "$BACKUP"
  [[ -d "$REPO_ROOT/.cursor/rules" ]] && cp -r "$REPO_ROOT/.cursor/rules" "$BACKUP/"
  [[ -d "$REPO_ROOT/.cursor/skills" ]] && cp -r "$REPO_ROOT/.cursor/skills" "$BACKUP/"
fi

# Clone ECC (shallow)
echo "Cloning ECC..."
mkdir -p "$TEMP_DIR"
git clone --depth 1 "$ECC_REPO" "$TEMP_DIR/ecc"

# Run ECC install into this repo's .cursor (script expects cwd = target project)
echo "Running ECC install --target cursor $LANGS"
"$TEMP_DIR/ecc/install.sh" --target cursor $LANGS

# Restore Barodoc-specific rules and skills
if [[ -d "$BACKUP" ]]; then
  echo "Restoring Barodoc rules and skills..."
  mkdir -p "$REPO_ROOT/.cursor/rules" "$REPO_ROOT/.cursor/skills"
  if [[ -d "$BACKUP/rules" ]]; then
    for f in "$BACKUP/rules"/*.mdc; do
      [[ -f "$f" ]] && cp "$f" "$REPO_ROOT/.cursor/rules/"
    done
  fi
  if [[ -d "$BACKUP/skills" ]]; then
    for d in "$BACKUP/skills"/barodoc-*; do
      [[ -d "$d" ]] && cp -r "$d" "$REPO_ROOT/.cursor/skills/"
    done
  fi
  rm -rf "$BACKUP"
  echo "Barodoc rules and skills restored."
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Done. ECC + Barodoc Cursor config is in .cursor/"
echo "  - ECC: rules (common + $LANGS), skills, hooks, agents, commands"
echo "  - Barodoc: .cursor/rules/*.mdc, .cursor/skills/barodoc-*"
echo "See https://github.com/affaan-m/everything-claude-code and docs/ai-setup.md"

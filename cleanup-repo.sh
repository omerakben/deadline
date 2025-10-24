#!/bin/bash
# DEADLINE Repository Maintenance Script
# Keeps documentation focused on developer guides and removes legacy artifacts.

set -euo pipefail

GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

info() {
  printf "%b%s%b\n" "$BLUE" "$1" "$NC"
}

success() {
  printf "%b%s%b\n" "$GREEN" "$1" "$NC"
}

warn() {
  printf "%b%s%b\n" "$YELLOW" "$1" "$NC"
}

info "🧹 Pruning legacy docs and keeping developer-focused guides"

# Ensure docs/development exists
mkdir -p docs/development
success "Ensured docs/development/ directory"

# Move AGENTS.md into developer docs as AI guidelines, if present
if [[ -f AGENTS.md ]]; then
  mv AGENTS.md docs/development/ai-guidelines.md
  success "Moved AGENTS.md to docs/development/ai-guidelines.md"
fi

# Remove legacy AI/Claude artefacts
if [[ -f CLAUDE.md ]]; then
  rm CLAUDE.md
  success "Removed CLAUDE.md"
fi

if [[ -d claudedocs ]]; then
  rm -rf claudedocs
  success "Removed claudedocs/ directory"
fi

if [[ -d capstone-server/claudedocs ]]; then
  rm -rf capstone-server/claudedocs
  success "Removed capstone-server/claudedocs/ directory"
fi

# Drop deprecated documentation folders if they resurface
for dir in docs/archive docs/deployment; do
  if [[ -d "$dir" ]]; then
    rm -rf "$dir"
    success "Removed $dir/"
  fi
done

# Remove TODO checklists that should not live in showcase repo
for todo in TODO.md capstone-server/TODO.md capstone-client/TODO_CLIENT.md; do
  if [[ -f "$todo" ]]; then
    rm "$todo"
    success "Deleted $todo"
  fi
done

warn "Manual follow-up: review docs/development/ contents for freshness"
success "Cleanup complete"

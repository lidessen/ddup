# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DDUP (DayDayUp) is a CLI tool for updating development dependencies and tools. It has two implementations:

1. A legacy bash script (`ddup`) using gum for UI
2. A modern TypeScript/React implementation (`src/ddup.tsx`) using Ink for terminal UI

## Development Commands

```bash
# Install dependencies (using Bun)
bun install

# Build the project
bun run build

# Development mode with watch
bun run dev

# Link for local testing
bun run link

# Prepare for publishing
bun run prepublishOnly
```

## Architecture

### Core Components

**Main Entry Point**: `src/ddup.tsx`

- React-based CLI using Ink framework for terminal UI
- Handles both interactive and non-interactive modes
- Manages task execution with live output streaming

**Configuration System**: `src/config.ts`

- YAML-based configuration stored at `~/.ddup.yml`
- Defines update tasks with optional dependency checks
- Supports enabling/disabling individual tasks

**Build Configuration**: `tsdown.config.ts`

- Bundles all dependencies into a single ESM output
- Outputs to `dist/ddup.js` with shebang for direct execution

### Key Design Patterns

1. **Task Execution Model**: Each task runs sequentially with real-time output capture via `execa`. Tasks can be skipped if their `check_command` fails.

2. **UI State Management**: Uses React hooks for managing:
   - Task status (pending/running/completed/failed/skipped)
   - Live output buffer (limited to 15 lines)
   - Interactive selection state

3. **Interactive Mode**: Uses `ink-select-input` for task selection with visual indicators:
   - `○` for unselected, `✓` for selected
   - Support for "Select All" and dynamic start button text

## Current Implementation Notes

The TypeScript version in `src/ddup.tsx` is the active codebase. The bash script `ddup` is legacy and should not be modified.

When working on the interactive mode:

- The current implementation uses `ink-select-input` which has limitations
- Selection state is managed via `selectedTasks` array
- The UI needs improvements for:
  - Better keyboard shortcuts (space to select, enter to confirm)
  - Proper Ctrl+C handling
  - Empty selection edge cases

## Testing Approach

Currently no automated tests. Manual testing workflow:

1. Build with `bun run build`
2. Test locally with `bun run src/ddup.tsx` or after linking
3. Test both interactive (`--interactive`) and default modes
4. Verify config initialization with `--init`

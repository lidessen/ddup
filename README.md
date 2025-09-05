# DDUP (DayDayUp) 🚀

A customizable CLI tool to keep your development dependencies and tools up to date with style.

## What is DDUP?

DDUP stands for "DayDayUp" (天天向上) - the philosophy of continuous improvement. It's a universal tool that helps developers maintain their development environment by automating updates for various package managers, language toolchains, and system tools.

## Features

- 📦 **Universal Package Manager Support** - Homebrew, npm, pnpm, yarn, pip, cargo, and more
- 🔧 **Language Toolchain Updates** - Rust, Deno, Bun, Python, Ruby, PHP, etc.
- ⚙️ **Fully Customizable** - YAML-based configuration for your specific needs
- 🎯 **Smart Execution** - Only runs commands for tools that are actually installed
- 🎨 **Beautiful Interface** - Interactive CLI with progress indicators
- 🔒 **Safe by Default** - Preview mode and confirmation prompts

## Installation

```bash
npm install -g ddup
```

Or with bun:

```bash
bun install -g ddup
```

## Quick Start

1. **Initialize your configuration:**

   ```bash
   ddup --init
   ```

2. **Edit your configuration file:**

   ```bash
   # The config file is created at ~/.ddup.yml
   # Enable the tools you want to update by setting enabled: true
   ```

3. **Run updates:**
   ```bash
   ddup
   ```

## Configuration

DDUP uses a simple YAML configuration file located at `~/.ddup.yml`. Here's an example:

```yaml
tasks:
  # Package managers
  - name: Homebrew
    command: brew update && brew upgrade && brew cleanup
    check_command: brew
    enabled: true
    description: Update Homebrew packages

  - name: npm
    command: npm update -g
    check_command: npm
    enabled: false
    description: Update global npm packages

  # Language toolchains
  - name: Rustup
    command: rustup update
    check_command: rustup
    enabled: false
    description: Update Rust toolchain

  # Add your custom tasks here
  - name: Your Custom Task
    command: your-command-here
    check_command: command-to-check # Optional
    enabled: true
    description: Task description
```

### Configuration Options

- **name**: Display name for the task
- **command**: The update command to execute
- **check_command**: (Optional) Command to check if the tool is installed
- **enabled**: Whether to run this task (true/false)
- **description**: Human-readable description of what the task does

## Common Use Cases

### Web Developer

```yaml
tasks:
  - name: Node.js packages
    command: npm update -g
    check_command: npm
    enabled: true

  - name: Yarn packages
    command: yarn global upgrade
    check_command: yarn
    enabled: true
```

### Rust Developer

```yaml
tasks:
  - name: Rust toolchain
    command: rustup update
    check_command: rustup
    enabled: true

  - name: Cargo packages
    command: cargo install-update -a
    check_command: cargo-update
    enabled: true
```

### Python Developer

```yaml
tasks:
  - name: pip packages
    command: pip list --outdated --format=json | python -c "import json,sys;print(' '.join([x['name'] for x in json.load(sys.stdin)]))" | xargs -n1 pip install -U
    check_command: pip
    enabled: true

  - name: pipx packages
    command: pipx upgrade-all
    check_command: pipx
    enabled: true
```

## CLI Commands

- `ddup` - Run all enabled update tasks
- `ddup --interactive` - Interactive mode to select tasks
- `ddup --init` - Create an example configuration file
- `ddup --config` - Show configuration file path
- `ddup --help` - Show help information

## Why DDUP?

- **Time Saver**: No more remembering different update commands for different tools
- **Consistency**: Standardized update process across all your development tools
- **Flexibility**: Easily add custom update tasks for your specific workflow
- **Safety**: Built-in checks ensure commands only run when tools are available

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

---

**DayDayUp** - Keep improving, one update at a time! 🌟

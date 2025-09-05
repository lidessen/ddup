import { parseYAML } from "confbox";
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export interface TaskConfig {
  name: string;
  command: string;
  check_command?: string;
  disabled?: boolean;
  description?: string;
}

export interface DdupConfig {
  tasks: TaskConfig[];
}

const DEFAULT_CONFIG: DdupConfig = {
  tasks: [],
};

export function loadConfig(): DdupConfig {
  const configPath = join(homedir(), ".ddup.yml");

  if (!existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const configContent = readFileSync(configPath, "utf-8");
    const parsed = parseYAML(configContent) as DdupConfig;

    if (parsed.tasks) {
      parsed.tasks = parsed.tasks.filter((task) => !task.disabled);
    }

    return parsed;
  } catch (error) {
    console.error(`Error loading config from ${configPath}:`, error);
    console.log("Using default configuration...");
    return DEFAULT_CONFIG;
  }
}

export function getConfigPath(): string {
  return join(homedir(), ".ddup.yml");
}

export function generateExampleConfig(): string {
  return `# DDUP Configuration
# ~/.ddup.yml

tasks:
  - name: Homebrew
    command: brew update && brew upgrade && brew cleanup
    check_command: brew
    description: Update Homebrew packages

  - name: npm
    command: npm update -g
    check_command: npm
    disabled: true
    description: Update global npm packages

  - name: Rustup
    command: rustup update
    check_command: rustup
    disabled: true
    description: Update Rust toolchain

# Add more tasks as needed
# Format:
#   - name: Tool Name
#     command: update command
#     check_command: command to verify tool exists (optional)
#     disabled: true  # Optional, defaults to false (enabled)
#     description: What this does (optional)
`;
}

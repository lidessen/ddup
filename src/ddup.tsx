#!/usr/bin/env node

import { signal, computed } from "semajsx";
import {
  render,
  useExit,
  onKeypress,
  Spinner,
  when,
} from "semajsx/terminal";
import { execa } from "execa";
import meow from "meow";
import { writeFileSync } from "fs";
import { loadConfig, getConfigPath, generateExampleConfig } from "./config.js";
import { InteractiveSelect } from "./interactive.js";

type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "not_selected";

interface Task {
  name: string;
  command: string;
  checkCommand?: string;
  status: TaskStatus;
  output?: string;
  description?: string;
}

function TaskItem({ task }: { task: Task }) {
  switch (task.status) {
    case "pending":
      return (
        <box>
          <text color="gray">○ {task.name}</text>
        </box>
      );
    case "running":
      return (
        <box>
          <Spinner label={task.name} />
        </box>
      );
    case "completed":
      return (
        <box flexDirection="row">
          <text color="green">✓ </text>
          <text color="white">{task.name}</text>
        </box>
      );
    case "failed":
      return (
        <box flexDirection="row">
          <text color="red">✗ </text>
          <text color="white">{task.name}</text>
        </box>
      );
    case "skipped":
      return (
        <box>
          <text color="gray" dim>
            - {task.name} (not installed)
          </text>
        </box>
      );
    case "not_selected":
      return (
        <box>
          <text color="gray" dim strikethrough>
            ⊘ {task.name} (skipped)
          </text>
        </box>
      );
    default:
      return <box />;
  }
}

function OutputLine({ line }: { line: string }) {
  if (line.startsWith("[") && line.endsWith("]")) {
    return (
      <text color="blue" bold>
        {line}
      </text>
    );
  } else if (line.startsWith("✨")) {
    return (
      <box marginTop={1}>
        <text color="green" bold>
          {line}
        </text>
      </box>
    );
  } else if (line.startsWith("⚠")) {
    return (
      <box marginTop={1}>
        <text color="yellow" bold>
          {line}
        </text>
      </box>
    );
  } else if (line.trim() === "") {
    return <box height={1} />;
  } else {
    return (
      <text color="gray" dim>
        {line}
      </text>
    );
  }
}

function App({
  interactive,
  initConfig,
}: {
  interactive: boolean;
  initConfig?: boolean;
}) {
  const exit = useExit();

  if (initConfig) {
    const configPath = getConfigPath();
    try {
      writeFileSync(configPath, generateExampleConfig());
      console.log(`✓ Created config file at ${configPath}`);
      console.log(
        "Edit this file to customize your update tasks, then run ddup again.",
      );
    } catch (error) {
      console.error(`✗ Failed to create config file: ${error}`);
    }
    exit();
    return <box />;
  }

  const config = loadConfig();
  const initialTasks: Task[] = config.tasks.map((task) => ({
    name: task.name,
    command: task.command,
    checkCommand: task.check_command,
    status: "pending" as TaskStatus,
    description: task.description,
  }));

  const tasks = signal<Task[]>(initialTasks);
  const isRunning = signal(false);
  const showInteractive = signal(interactive);
  const selectedTasks = signal<string[]>([]);
  const liveOutput = signal<string[]>([]);
  const maxOutputLines = 15;

  const commandExists = async (command: string): Promise<boolean> => {
    try {
      await execa("which", [command]);
      return true;
    } catch {
      return false;
    }
  };

  const updateTaskStatus = (
    index: number,
    status: TaskStatus,
    output?: string,
  ) => {
    tasks.update((prev) => {
      const newTasks = [...prev];
      newTasks[index] = { ...newTasks[index], status, output };
      return newTasks;
    });
  };

  const runTask = async (taskIndex: number) => {
    const task = tasks.value[taskIndex];

    if (task.checkCommand) {
      const exists = await commandExists(task.checkCommand);
      if (!exists) {
        updateTaskStatus(taskIndex, "skipped");
        liveOutput.update((prev) =>
          [...prev, `[${task.name}] Skipped - not installed`].slice(
            -maxOutputLines,
          ),
        );
        return;
      }
    }

    updateTaskStatus(taskIndex, "running");

    const separator = `[${task.name}]`;

    if (liveOutput.value.length > 0) {
      liveOutput.update((prev) =>
        [...prev, "", separator].slice(-maxOutputLines),
      );
    } else {
      liveOutput.update((prev) =>
        [...prev, separator].slice(-maxOutputLines),
      );
    }

    try {
      const subprocess = execa("bash", ["-c", task.command]);

      const outputLines: string[] = [];

      subprocess.stdout?.on("data", (data: Buffer) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        outputLines.push(...lines);

        liveOutput.update((prev) => [...prev, ...lines].slice(-maxOutputLines));
      });

      subprocess.stderr?.on("data", (data: Buffer) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        outputLines.push(...lines);

        liveOutput.update((prev) => [...prev, ...lines].slice(-maxOutputLines));
      });

      await subprocess;

      updateTaskStatus(taskIndex, "completed", outputLines.join("\n"));
    } catch (error: any) {
      const errorOutput = error.stderr || error.message || "Unknown error";
      updateTaskStatus(taskIndex, "failed", errorOutput);
      const errorLines = errorOutput
        .split("\n")
        .filter((line: string) => line.trim());
      liveOutput.update((prev) =>
        [...prev, ...errorLines].slice(-maxOutputLines),
      );
    }
  };

  const runAllTasks = async () => {
    isRunning.set(true);
    liveOutput.set([]);

    const currentTasks = tasks.value;
    const selected = selectedTasks.value;

    const tasksToRun =
      interactive && selected.length > 0
        ? currentTasks.filter((t) => selected.includes(t.name))
        : currentTasks;

    if (interactive && selected.length > 0) {
      currentTasks.forEach((task, index) => {
        if (!selected.includes(task.name)) {
          updateTaskStatus(index, "not_selected");
        }
      });
    }

    for (const task of tasksToRun) {
      const taskIndex = currentTasks.findIndex((t) => t.name === task.name);
      if (taskIndex !== -1) {
        await runTask(taskIndex);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    isRunning.set(false);

    const failedCount = tasks.value.filter((t) => t.status === "failed").length;
    if (failedCount > 0) {
      liveOutput.update((prev) =>
        [...prev, "", `⚠ Completed with ${failedCount} failure(s)`].slice(
          -maxOutputLines,
        ),
      );
    } else {
      liveOutput.update((prev) =>
        [...prev, "", "✨ All tasks completed successfully!"].slice(
          -maxOutputLines,
        ),
      );
    }

    setTimeout(() => {
      exit();
    }, 3000);
  };

  const handleInteractiveSubmit = (selected: string[]) => {
    selectedTasks.set(selected);
    showInteractive.set(false);
    void runAllTasks();
  };

  onKeypress((event) => {
    if (event.key === "c" && event.ctrl && isRunning.value) {
      console.log("\n⚠️  Update interrupted by user");
      exit();
    }
  });

  // Auto-start for non-interactive mode
  if (!interactive) {
    void runAllTasks();
  }

  const isInteractive = computed(
    [showInteractive, isRunning],
    (show, running) => show && !running,
  );

  // Reactive task list - re-evaluates when tasks signal changes
  const taskListView = computed([tasks], (taskList) =>
    taskList.map((task) => <TaskItem task={task} />),
  );

  // Reactive output view - re-evaluates when liveOutput signal changes
  const outputView = computed([liveOutput], (lines) =>
    lines.map((line) => <OutputLine line={line} />),
  );

  const hasOutput = computed([liveOutput], (lines) => lines.length > 0);

  return (
    <box flexDirection="column">
      {when(isInteractive, () => (
        <InteractiveSelect
          tasks={tasks.value.map((t) => ({
            name: t.name,
            description: t.description,
          }))}
          onSubmit={handleInteractiveSubmit}
        />
      ))}
      {when(
        computed([isInteractive], (v) => !v),
        () => (
          <box flexDirection="column" paddingTop={1} paddingBottom={1}>
            <box marginBottom={1}>
              <text color="magenta" bold>
                ◆ Day Day Up 天天向上
              </text>
            </box>

            <box flexDirection="column">
              <box flexDirection="column" marginBottom={1}>
                {taskListView}
              </box>

              {when(hasOutput, () => (
                <box flexDirection="column">{outputView}</box>
              ))}
            </box>
          </box>
        ),
      )}
    </box>
  );
}

const cli = meow(
  `
  Usage
    $ ddup

  Options
    --interactive, -i  Interactive mode to select what to update
    --init             Create a configuration file at ~/.ddup.yml
    --config           Show configuration file path
    --help, -h         Show this help message

  Examples
    $ ddup                 # Update all enabled tasks
    $ ddup --interactive   # Choose which tasks to run
    $ ddup --init          # Create config file
    $ ddup --config        # Show config file location
`,
  {
    importMeta: import.meta,
    flags: {
      interactive: {
        type: "boolean",
        shortFlag: "i",
      },
      init: {
        type: "boolean",
      },
      config: {
        type: "boolean",
      },
      help: {
        type: "boolean",
        shortFlag: "h",
      },
    },
  },
);

// Handle help and version flags (meow handles these automatically)
if (cli.flags.help || cli.input.includes("help")) {
  cli.showHelp();
  process.exit(0);
}

if (cli.flags.config) {
  console.log(`Config file location: ${getConfigPath()}`);
  process.exit(0);
}

render(
  <App
    interactive={cli.flags.interactive ?? false}
    initConfig={cli.flags.init ?? false}
  />,
);

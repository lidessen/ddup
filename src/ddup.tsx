#!/usr/bin/env node

import React, { useState, useEffect } from "react";
import { render, Text, Box, useApp, useInput } from "ink";
import { Spinner } from "@inkjs/ui";
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

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
  const getStatusDisplay = () => {
    switch (task.status) {
      case "pending":
        return (
          <Box>
            <Text color="gray">○ </Text>
            <Text color="gray">{task.name}</Text>
          </Box>
        );
      case "running":
        return (
          <Box>
            <Spinner label={task.name} />
          </Box>
        );
      case "completed":
        return (
          <Box>
            <Text color="green">✓ </Text>
            <Text color="white">{task.name}</Text>
          </Box>
        );
      case "failed":
        return (
          <Box>
            <Text color="red">✗ </Text>
            <Text color="white">{task.name}</Text>
          </Box>
        );
      case "skipped":
        return (
          <Box>
            <Text color="gray">- </Text>
            <Text color="gray">{task.name} </Text>
            <Text color="gray" dimColor>
              (not installed)
            </Text>
          </Box>
        );
      case "not_selected":
        return (
          <Box>
            <Text color="gray">⊘ </Text>
            <Text color="gray" dimColor strikethrough>
              {task.name}
            </Text>
            <Text color="gray" dimColor>
              {" "}
              (skipped)
            </Text>
          </Box>
        );
      default:
        return null;
    }
  };

  return <Box>{getStatusDisplay()}</Box>;
};

const App: React.FC<{ interactive: boolean; initConfig?: boolean }> = ({
  interactive,
  initConfig,
}) => {
  const { exit } = useApp();

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
    return null;
  }

  const config = loadConfig();
  const initialTasks: Task[] = config.tasks.map((task) => ({
    name: task.name,
    command: task.command,
    checkCommand: task.check_command,
    status: "pending" as TaskStatus,
    description: task.description,
  }));

  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const [isRunning, setIsRunning] = useState(false);
  const [showInteractive, setShowInteractive] = useState(interactive);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [liveOutput, setLiveOutput] = useState<string[]>([]);
  const [interactiveCompleted, setInteractiveCompleted] = useState(false);
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
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      newTasks[index] = { ...newTasks[index], status, output };
      return newTasks;
    });
  };

  const runTask = async (taskIndex: number) => {
    const task = tasks[taskIndex];

    if (task.checkCommand) {
      const exists = await commandExists(task.checkCommand);
      if (!exists) {
        updateTaskStatus(taskIndex, "skipped");
        setLiveOutput((prev) =>
          [...prev, `[${task.name}] Skipped - not installed`].slice(
            -maxOutputLines,
          ),
        );
        return;
      }
    }

    updateTaskStatus(taskIndex, "running");

    const separator = `[${task.name}]`;

    if (liveOutput.length > 0) {
      setLiveOutput((prev) => [...prev, "", separator].slice(-maxOutputLines));
    } else {
      setLiveOutput((prev) => [...prev, separator].slice(-maxOutputLines));
    }

    try {
      const subprocess = execa("bash", ["-c", task.command]);

      const outputLines: string[] = [];

      subprocess.stdout?.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        outputLines.push(...lines);

        setLiveOutput((prev) => {
          const newLines = lines.map((line: string) => line);
          return [...prev, ...newLines].slice(-maxOutputLines);
        });
      });

      subprocess.stderr?.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((line: string) => line.trim());
        outputLines.push(...lines);

        setLiveOutput((prev) => {
          const newLines = lines.map((line: string) => line);
          return [...prev, ...newLines].slice(-maxOutputLines);
        });
      });

      await subprocess;

      updateTaskStatus(taskIndex, "completed", outputLines.join("\n"));
    } catch (error: any) {
      const errorOutput = error.stderr || error.message || "Unknown error";
      updateTaskStatus(taskIndex, "failed", errorOutput);
      const errorLines = errorOutput
        .split("\n")
        .filter((line: string) => line.trim());
      setLiveOutput((prev) => [...prev, ...errorLines].slice(-maxOutputLines));
    }
  };

  const runAllTasks = async () => {
    setIsRunning(true);
    setLiveOutput([]);

    const tasksToRun =
      interactive && selectedTasks.length > 0
        ? tasks.filter((t) => selectedTasks.includes(t.name))
        : tasks;

    if (interactive && selectedTasks.length > 0) {
      tasks.forEach((task, index) => {
        if (!selectedTasks.includes(task.name)) {
          updateTaskStatus(index, "not_selected");
        }
      });
    }

    for (const task of tasksToRun) {
      const taskIndex = tasks.findIndex((t) => t.name === task.name);
      if (taskIndex !== -1) {
        await runTask(taskIndex);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    setIsRunning(false);

    const failedCount = tasks.filter((t) => t.status === "failed").length;
    if (failedCount > 0) {
      setLiveOutput((prev) =>
        [...prev, "", `⚠ Completed with ${failedCount} failure(s)`].slice(
          -maxOutputLines,
        ),
      );
    } else {
      setLiveOutput((prev) =>
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
    setSelectedTasks(selected);
    setShowInteractive(false);
    setInteractiveCompleted(true);
  };

  useInput(
    (input, key) => {
      if (input === "c" && key.ctrl && isRunning) {
        console.log("\n⚠️  Update interrupted by user");
        exit();
      }
    },
    { isActive: process.stdin.isTTY && !process.env.CI && isRunning },
  );

  useEffect(() => {
    if (!showInteractive && !interactive) {
      void runAllTasks();
    } else if (interactiveCompleted && selectedTasks.length > 0) {
      void runAllTasks();
    }
  }, [interactiveCompleted]);

  if (showInteractive && !isRunning) {
    return (
      <InteractiveSelect
        tasks={tasks.map((t) => ({
          name: t.name,
          description: t.description,
        }))}
        onSubmit={handleInteractiveSubmit}
      />
    );
  }

  return (
    <Box flexDirection="column" paddingY={1}>
      <Box marginBottom={1}>
        <Text color="magenta" bold>
          ◆ Day Day Up 天天向上
        </Text>
      </Box>

      <Box flexDirection="column">
        <Box flexDirection="column" marginBottom={1}>
          {tasks.map((task) => (
            <TaskItem key={task.name} task={task} />
          ))}
        </Box>

        {liveOutput.length > 0 && (
          <Box flexDirection="column">
            {liveOutput.map((line: string, i: number) => {
              if (line.startsWith("[") && line.endsWith("]")) {
                return (
                  <Text key={i} color="blue" bold>
                    {line}
                  </Text>
                );
              } else if (line.startsWith("✨")) {
                return (
                  <Box key={i} marginTop={1}>
                    <Text color="green" bold>
                      {line}
                    </Text>
                  </Box>
                );
              } else if (line.startsWith("⚠")) {
                return (
                  <Box key={i} marginTop={1}>
                    <Text color="yellow" bold>
                      {line}
                    </Text>
                  </Box>
                );
              } else if (line.trim() === "") {
                return <Box key={i} height={1} />;
              } else {
                return (
                  <Text key={i} color="gray" dimColor>
                    {line}
                  </Text>
                );
              }
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};

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
if (cli.flags.help || cli.input.includes('help')) {
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

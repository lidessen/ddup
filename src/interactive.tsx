import React from "react";
import { Box, Text, useApp, useInput, useStdin } from "ink";
import { MultiSelect } from "@inkjs/ui";

interface InteractiveSelectProps {
  tasks: Array<{
    name: string;
    description?: string;
  }>;
  onSubmit: (selected: string[]) => void;
}

export const InteractiveSelect: React.FC<InteractiveSelectProps> = ({
  tasks,
  onSubmit,
}) => {
  const { exit } = useApp();
  const { isRawModeSupported } = useStdin();

  useInput(
    (input, key) => {
      if (input === "c" && key.ctrl) {
        console.log("\n✨ Update cancelled by user");
        exit();
      }
    },
    { isActive: isRawModeSupported },
  );

  const handleMultiSelectSubmit = (values: string[]) => {
    if (values.length === 0) {
      console.log("\n📌 No tasks selected. Exiting...");
      exit();
    } else {
      onSubmit(values);
    }
  };

  const options = tasks.map((task) => ({
    label: task.description ? `${task.name} - ${task.description}` : task.name,
    value: task.name,
  }));

  return (
    <Box flexDirection="column" paddingY={1}>
      <Box marginBottom={1}>
        <Text color="magenta" bold>
          ◆ Day Day Up 天天向上
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">Select tools to update:</Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor italic>
          Space to select • Enter to confirm • Ctrl+C to cancel
        </Text>
      </Box>

      <MultiSelect
        options={options}
        onSubmit={handleMultiSelectSubmit}
        defaultValue={[]}
      />
    </Box>
  );
};

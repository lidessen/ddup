import { useExit, onKeypress, MultiSelect } from "semajsx/terminal";

interface InteractiveSelectProps {
  tasks: Array<{
    name: string;
    description?: string;
  }>;
  onSubmit: (selected: string[]) => void;
}

export function InteractiveSelect({ tasks, onSubmit }: InteractiveSelectProps) {
  const exit = useExit();

  onKeypress((event) => {
    if (event.key === "c" && event.ctrl) {
      console.log("\n✨ Update cancelled by user");
      exit();
    }
  });

  const handleConfirm = (values: string[]) => {
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
    <column paddingTop={1} paddingBottom={1}>
      <box marginBottom={1}>
        <text color="magenta" bold>
          ◆ Day Day Up 天天向上
        </text>
      </box>

      <box marginBottom={1}>
        <text color="gray">Select tools to update:</text>
      </box>

      <box marginBottom={1}>
        <text dim italic>
          Space to select • Enter to confirm • Ctrl+C to cancel
        </text>
      </box>

      <MultiSelect options={options} onConfirm={handleConfirm} />
    </column>
  );
}

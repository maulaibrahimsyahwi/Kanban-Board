import { DEFAULT_LABELS, TaskLabel } from "@/constants";
import type { Project } from "@/types";

export type AppliedLabel = TaskLabel & { id: string };

export function buildAvailableLabels({
  selectedProject,
  initialTaskLabels,
}: {
  selectedProject?: Project | null;
  initialTaskLabels: Array<{ name: string; color: string }>;
}) {
  const labelMap = new Map<string, AppliedLabel>(
    DEFAULT_LABELS.map((label) => [label.id, label as AppliedLabel])
  );

  if (selectedProject) {
    selectedProject.boards.forEach((board) => {
      board.tasks.forEach((task) => {
        task.labels.forEach((label) => {
          const defaultMatch = DEFAULT_LABELS.find((d) => d.name === label.name);

          let id = defaultMatch?.id;

          if (!id) {
            const editedMatch = Array.from(labelMap.values()).find(
              (l) => l.name === label.name
            );
            id = editedMatch?.id || label.name;
          }

          const currentLabelInMap = labelMap.get(id);
          if (currentLabelInMap && currentLabelInMap.name !== label.name) {
            labelMap.set(id, {
              id: id,
              name: label.name,
              color: label.color,
            });
          }
        });
      });
    });
  }

  initialTaskLabels.forEach((appliedLabel) => {
    const defaultMatch = DEFAULT_LABELS.find((d) => d.name === appliedLabel.name);
    const id = defaultMatch?.id || appliedLabel.name;
    const appliedWithId: AppliedLabel = {
      id: id,
      name: appliedLabel.name,
      color: appliedLabel.color,
    };
    if (labelMap.has(appliedWithId.id)) {
      labelMap.set(appliedWithId.id, appliedWithId);
    }
  });

  return Array.from(labelMap.values());
}

export function mapTaskLabelsWithIds({
  taskLabels,
  availableLabels,
}: {
  taskLabels: Array<{ name: string; color: string }>;
  availableLabels: AppliedLabel[];
}) {
  return taskLabels.map((label) => {
    const stateLabel = availableLabels.find((l) => l.name === label.name);
    const id = stateLabel?.id || label.name;
    return {
      id: id,
      name: label.name,
      color: label.color,
    };
  }) as AppliedLabel[];
}


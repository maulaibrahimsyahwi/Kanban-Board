import type { Project, Task, UserProfile } from "@/types";

import type { ProjectDTO } from "./types";
import { getProjectIcon } from "./icon-map";

function mapUserProfile(user: ProjectDTO["owner"]): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isVirtual: user.isVirtual ?? undefined,
    resourceColor: user.resourceColor ?? null,
    resourceType: user.resourceType ?? null,
    role: user.role,
  };
}

export function mapProjectsFromDto(dbProjects: ProjectDTO[]): Project[] {
  return dbProjects.map((p) => ({
    id: p.id,
    name: p.name,
    ownerId: p.ownerId,
    icon: getProjectIcon(p.icon),
    createdAt: new Date(p.createdAt),
    owner: mapUserProfile(p.owner),
    members: p.members.map((member) => ({
      ...mapUserProfile(member.user),
      role: member.role,
    })),
    statusId: p.statusId,
    status: p.status,
    boards: p.boards.map((b) => ({
      id: b.id,
      name: b.name,
      createdAt: new Date(b.createdAt),
      tasks: b.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || "",
        priority: t.priority as Task["priority"],
        progress: t.progress as Task["progress"],
        startDate: t.startDate ? new Date(t.startDate) : null,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        cardDisplayPreference:
          (t.cardDisplayPreference as Task["cardDisplayPreference"]) || "none",
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
        order: t.order,
        boardId: t.boardId,
        labels: t.labels,
        checklist: t.checklist,
        assignees: (t.assignees ?? []).map(mapUserProfile),
        attachments: t.attachments || [],
      })),
    })),
  }));
}

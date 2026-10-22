export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params?: unknown) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string | number) => [...projectKeys.details(), id] as const,
  members: (projectId: string | number) => [...projectKeys.detail(projectId), "members"] as const,
}

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params?: unknown) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string | number) => [...taskKeys.details(), id] as const,
  byProject: (projectId: string | number) => [...taskKeys.all, "by-project", projectId] as const,
  byAssignedTo: (userId: string | number, params?: unknown) =>
    [...taskKeys.all, "by-assigned", userId, params] as const,
  byCreatedBy: (userId: string | number, params?: unknown) =>
    [...taskKeys.all, "by-created", userId, params] as const,
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: unknown) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
}

export const commentKeys = {
  all: ["comments"] as const,
  byTask: (taskId: string | number) => [...commentKeys.all, "by-task", String(taskId)] as const,
}

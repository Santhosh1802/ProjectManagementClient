import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTask,
  createTaskDependency,
  createTaskSubtask,
  deleteTask,
  deleteTaskSubtask,
  getAllTasks,
  getProjectDependencies,
  getTaskById,
  getTaskDependencies,
  getTasksByAssignedTo,
  getTasksByCreatedBy,
  getTasksByProject,
  getTaskSubtasks,
  removeTaskDependency,
  reorderTaskSubtasks,
  updateTaskDetails,
  updateTaskStatus,
  updateTaskSubtask,
} from "../services/task.services"
import type {
  CreateSubtaskRequest,
  CreateTaskDependencyRequest,
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTasksByAssignedToRequest,
  GetTasksByCreatedByRequest,
  GetTasksByProjectRequest,
  GetTasksRequest,
  UpdateSubtaskRequest,
  UpdateTaskDetailsRequest,
  UpdateTaskStatusRequest,
} from "../types/task.types"
import { taskKeys, projectKeys, activityKeys } from "@/lib/queryKeys"

export function useTasksQuery(request: GetTasksRequest = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.list(request),
    queryFn: () => getAllTasks(request),
    enabled: options?.enabled ?? true,
  })
}

export function useTaskDetailQuery(id: string | number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => getTaskById({ id: String(id) }),
    enabled: Boolean(id) && (options?.enabled ?? true),
  })
}

export function useTasksByProjectQuery(request: GetTasksByProjectRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...taskKeys.byProject(request.projectId), request.page ?? 0, request.size ?? 10],
    queryFn: () => getTasksByProject(request),
    enabled: Boolean(request.projectId) && (options?.enabled ?? true),
  })
}

export function useTasksByAssignedToQuery(request: GetTasksByAssignedToRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.byAssignedTo(request.assignedToId, request),
    queryFn: () => getTasksByAssignedTo(request),
    enabled: Boolean(request.assignedToId) && (options?.enabled ?? true),
  })
}

export function useTasksByCreatedByQuery(request: GetTasksByCreatedByRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.byCreatedBy(request.createdByUserId, request),
    queryFn: () => getTasksByCreatedBy(request),
    enabled: Boolean(request.createdByUserId) && (options?.enabled ?? true),
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTaskRequest) => createTask(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (data?.project?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.project.id) })
      }
    },
  })
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateTaskStatusRequest) => updateTaskStatus(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) })
        void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(data.id) })
      }
      if (data?.project?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.project.id) })
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(data.project.id) })
      }
    },

  })
}

export function useUpdateTaskDetailsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateTaskDetailsRequest) => updateTaskDetails(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) })
      }
      if (data?.project?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.project.id) })
      }
    },
  })
}

export function useDeleteTaskMutation(projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: DeleteTaskRequest) => deleteTask(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
      }
    },
  })
}

export function useTaskDependenciesQuery(taskId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.dependencies(taskId ?? ""),
    queryFn: () => (taskId ? getTaskDependencies(taskId) : Promise.reject("No taskId")),
    enabled: Boolean(taskId) && (options?.enabled ?? true),
  })
}

export function useProjectDependenciesQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.projectDependencies(projectId ?? ""),
    queryFn: () => (projectId ? getProjectDependencies(projectId) : Promise.reject("No projectId")),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  })
}

export function useCreateTaskDependencyMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateTaskDependencyRequest) => createTaskDependency(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.dependencies(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.projectDependencies(projectId) })
      }
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(projectId) })
      }
    },
  })
}

export function useRemoveTaskDependencyMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dependencyId: string) => removeTaskDependency(dependencyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.dependencies(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.projectDependencies(projectId) })
      }
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(projectId) })
      }
    },
  })
}

export function useTaskSubtasksQuery(taskId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.subtasks(taskId ?? ""),
    queryFn: () => (taskId ? getTaskSubtasks(taskId) : Promise.reject("No taskId")),
    enabled: Boolean(taskId) && (options?.enabled ?? true),
  })
}

export function useCreateSubtaskMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateSubtaskRequest) => createTaskSubtask(taskId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(projectId) })
      }
    },
  })
}

export function useUpdateSubtaskMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ subtaskId, data }: { subtaskId: string; data: UpdateSubtaskRequest }) =>
      updateTaskSubtask(taskId, subtaskId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(projectId) })
      }
    },
  })
}

export function useReorderSubtasksMutation(taskId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subtaskIds: string[]) => reorderTaskSubtasks(taskId, subtaskIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) })
    },
  })
}

export function useDeleteSubtaskMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (subtaskId: string) => deleteTaskSubtask(taskId, subtaskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      void queryClient.invalidateQueries({ queryKey: activityKeys.byTask(taskId) })
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: activityKeys.byProject(projectId) })
      }
    },
  })
}

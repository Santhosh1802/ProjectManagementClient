import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByAssignedTo,
  getTasksByCreatedBy,
  getTasksByProject,
  updateTaskDetails,
  updateTaskStatus,
} from "../services/task.services"
import type {
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTasksByAssignedToRequest,
  GetTasksByCreatedByRequest,
  GetTasksByProjectRequest,
  GetTasksRequest,
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
    queryFn: () => (taskId ? import("../services/task.services").then(m => m.getTaskDependencies(taskId)) : Promise.reject("No taskId")),
    enabled: Boolean(taskId) && (options?.enabled ?? true),
  })
}

export function useProjectDependenciesQuery(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: taskKeys.projectDependencies(projectId ?? ""),
    queryFn: () => (projectId ? import("../services/task.services").then(m => m.getProjectDependencies(projectId)) : Promise.reject("No projectId")),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  })
}

export function useCreateTaskDependencyMutation(taskId: string, projectId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: import("../types/task.types").CreateTaskDependencyRequest) =>
      import("../services/task.services").then(m => m.createTaskDependency(request)),
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
    mutationFn: (dependencyId: string) =>
      import("../services/task.services").then(m => m.removeTaskDependency(dependencyId)),
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

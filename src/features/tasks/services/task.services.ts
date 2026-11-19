import api from "@/config/api"

import type {
  ApiResponse,
  CreateSubtaskRequest,
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskByIdRequest,
  GetTasksByAssignedToRequest,
  GetTasksByCreatedByRequest,
  GetTasksByProjectRequest,
  GetTasksRequest,
  Task,
  TaskPageResponse,
  TaskSubtask,
  UpdateSubtaskRequest,
  UpdateTaskDetailsRequest,
  UpdateTaskStatusRequest,
} from "../types/task.types"

/**
 * Create a task.
 * POST /api/tasks/create
 */
export async function createTask(
  request: CreateTaskRequest
): Promise<Task> {
  const response = await api.post<ApiResponse<Task>>(
    "/tasks/create",
    {
      title: request.title,
      description: request.description,
      taskStatus: request.taskStatus,
      taskPriority: request.taskPriority,
      dueDate: request.dueDate,
      projectId: request.projectId,
      assignedToId: request.assignedToId,
      ...(request.assigneeIds !== undefined
        ? { assigneeIds: request.assigneeIds }
        : {}),
    }
  )

  return response.data.data
}

/**
 * Get a task by ID.
 * GET /api/tasks/id?id={id}
 */
export async function getTaskById(
  request: GetTaskByIdRequest
): Promise<Task> {
  const response = await api.get<ApiResponse<Task>>(
    "/tasks/id",
    {
      params: {
        id: request.id,
      },
    }
  )

  return response.data.data
}

/**
 * Get all tasks with pagination.
 * GET /api/tasks/all?page={page}&size={size}
 */
export async function getAllTasks(
  request: GetTasksRequest = {}
): Promise<TaskPageResponse> {
  const response = await api.get<ApiResponse<TaskPageResponse>>(
    "/tasks/all",
    {
      params: {
        page: request.page ?? 0,
        size: request.size ?? 10,
      },
    }
  )

  return response.data.data
}

/**
 * Get tasks belonging to a project.
 * GET /api/tasks/by-project
 */
export async function getTasksByProject(
  request: GetTasksByProjectRequest
): Promise<TaskPageResponse> {
  const response = await api.get<ApiResponse<TaskPageResponse>>(
    "/tasks/by-project",
    {
      params: {
        projectId: request.projectId,
        page: request.page ?? 0,
        size: request.size ?? 10,
      },
    }
  )

  return response.data.data
}

/**
 * Get tasks assigned to a user.
 * GET /api/tasks/assigned-to
 */
export async function getTasksByAssignedTo(
  request: GetTasksByAssignedToRequest
): Promise<TaskPageResponse> {
  const response = await api.get<ApiResponse<TaskPageResponse>>(
    "/tasks/assigned-to",
    {
      params: {
        assignedToId: request.assignedToId,
        page: request.page ?? 0,
        size: request.size ?? 10,
      },
    }
  )

  return response.data.data
}

/**
 * Get tasks created by a user.
 * GET /api/tasks/created-by
 */
export async function getTasksByCreatedBy(
  request: GetTasksByCreatedByRequest
): Promise<TaskPageResponse> {
  const response = await api.get<ApiResponse<TaskPageResponse>>(
    "/tasks/created-by",
    {
      params: {
        createdByUserId: request.createdByUserId,
        page: request.page ?? 0,
        size: request.size ?? 10,
      },
    }
  )

  return response.data.data
}

/**
 * Update task details.
 * PUT /api/tasks/update-details
 */
export async function updateTaskDetails(
  request: UpdateTaskDetailsRequest
): Promise<Task> {
  const response = await api.put<ApiResponse<Task>>(
    "/tasks/update-details",
    {
      id: request.id,
      title: request.title,
      description: request.description,
      taskStatus: request.taskStatus,
      taskPriority: request.taskPriority,
      dueDate: request.dueDate,
      projectId: request.projectId,
      assignedToId: request.assignedToId,
      ...(request.assigneeIds !== undefined
        ? { assigneeIds: request.assigneeIds }
        : {}),
      createdById: request.createdById,
    }
  )

  return response.data.data
}

/**
 * Update task status.
 * PUT /api/tasks/update-status
 */
export async function updateTaskStatus(
  request: UpdateTaskStatusRequest
): Promise<Task> {
  const response = await api.put<ApiResponse<Task>>(
    "/tasks/update-status",
    {
      id: request.id,
      status: request.status,
    }
  )

  return response.data.data
}

/**
 * Delete a task.
 * DELETE /api/tasks/delete?id={id}
 */
export async function deleteTask(
  request: DeleteTaskRequest
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    "/tasks/delete",
    {
      params: {
        id: request.id,
      },
    }
  )

  return response.data.data
}

/**
 * Create a task dependency.
 * POST /api/task-dependencies
 */
export async function createTaskDependency(
  request: import("../types/task.types").CreateTaskDependencyRequest
): Promise<import("../types/task.types").TaskDependencySummary> {
  const response = await api.post<ApiResponse<import("../types/task.types").TaskDependencySummary>>(
    "/task-dependencies",
    request
  )
  return response.data.data
}

/**
 * Remove a task dependency.
 * DELETE /api/task-dependencies/{dependencyId}
 */
export async function removeTaskDependency(
  dependencyId: string
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    `/task-dependencies/${dependencyId}`
  )
  return response.data.data
}

/**
 * Get dependencies for a single task.
 * GET /api/task-dependencies/task/{taskId}
 */
export async function getTaskDependencies(
  taskId: string
): Promise<import("../types/task.types").TaskDependenciesResponse> {
  const response = await api.get<ApiResponse<import("../types/task.types").TaskDependenciesResponse>>(
    `/task-dependencies/task/${taskId}`
  )
  return response.data.data
}

/**
 * Get all dependencies across a project.
 * GET /api/task-dependencies/project/{projectId}
 */
export async function getProjectDependencies(
  projectId: string
): Promise<import("../types/task.types").ProjectDependencyEdge[]> {
  const response = await api.get<ApiResponse<import("../types/task.types").ProjectDependencyEdge[]>>(
    `/task-dependencies/project/${projectId}`
  )
  return response.data.data
}

/**
 * Search tasks with advanced multi-factor filtering.
 * GET /api/tasks/search
 */
export async function searchTasks(
  params: import("../types/task.types").TaskSearchParams
): Promise<TaskPageResponse> {
  const response = await api.get<ApiResponse<TaskPageResponse>>("/tasks/search", {
    params,
  })
  return response.data.data
}

/**
 * List subtasks / checklist items for a task.
 * GET /api/tasks/{taskId}/subtasks
 */
export async function getTaskSubtasks(taskId: string): Promise<TaskSubtask[]> {
  const response = await api.get<ApiResponse<TaskSubtask[]>>(
    `/tasks/${taskId}/subtasks`
  )
  return response.data.data
}

/**
 * Create a new subtask on a task.
 * POST /api/tasks/{taskId}/subtasks
 */
export async function createTaskSubtask(
  taskId: string,
  request: CreateSubtaskRequest
): Promise<TaskSubtask> {
  const response = await api.post<ApiResponse<TaskSubtask>>(
    `/tasks/${taskId}/subtasks`,
    request
  )
  return response.data.data
}

/**
 * Update a subtask (title, completion status, assignee, due date, sort order).
 * PATCH /api/tasks/{taskId}/subtasks/{subtaskId}
 */
export async function updateTaskSubtask(
  taskId: string,
  subtaskId: string,
  request: UpdateSubtaskRequest
): Promise<TaskSubtask> {
  const response = await api.patch<ApiResponse<TaskSubtask>>(
    `/tasks/${taskId}/subtasks/${subtaskId}`,
    request
  )
  return response.data.data
}

/**
 * Reorder subtasks for a task.
 * PUT /api/tasks/{taskId}/subtasks/reorder
 */
export async function reorderTaskSubtasks(
  taskId: string,
  subtaskIds: string[]
): Promise<TaskSubtask[]> {
  const response = await api.put<ApiResponse<TaskSubtask[]>>(
    `/tasks/${taskId}/subtasks/reorder`,
    { subtaskIds }
  )
  return response.data.data
}

/**
 * Delete a subtask from a task.
 * DELETE /api/tasks/{taskId}/subtasks/{subtaskId}
 */
export async function deleteTaskSubtask(
  taskId: string,
  subtaskId: string
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    `/tasks/${taskId}/subtasks/${subtaskId}`
  )
  return response.data.data
}
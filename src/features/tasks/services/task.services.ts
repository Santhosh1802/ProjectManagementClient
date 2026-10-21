import api from "@/config/api"

import type {
  ApiResponse,
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskByIdRequest,
  GetTasksByAssignedToRequest,
  GetTasksByCreatedByRequest,
  GetTasksByProjectRequest,
  GetTasksRequest,
  Task,
  TaskPageResponse,
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
      assignedToId: request.assignedToId
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
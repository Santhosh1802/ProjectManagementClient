import api from "@/config/api"

import type {
  ApiResponse,
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectByIdRequest,
  PageResponse,
  Project,
  ProjectSearchRequest,
  UpdateProjectDetailsRequest,
  UpdateProjectOwnerRequest,
} from "../types/project.types"

/**
 * Create a project.
 *
 * POST /api/projects
 *
 * The backend determines the project owner
 * from the currently authenticated user.
 */
export async function createProject(
  request: CreateProjectRequest
): Promise<Project> {
  const response = await api.post<ApiResponse<Project>>(
    "/projects",
    {
      name: request.name,
      description: request.description,
      startDate: request.startDate,
      dueDate: request.dueDate,
    }
  )

  return response.data.data
}

/**
 * Get project by ID.
 *
 * GET /api/projects/id?id={id}
 */
export async function getProjectById(
  request: GetProjectByIdRequest
): Promise<Project> {
  const response = await api.get<ApiResponse<Project>>(
    "/projects/id",
    {
      params: {
        id: request.id,
      },
    }
  )

  return response.data.data
}

/**
 * Search projects with pagination,
 * filtering and sorting.
 *
 * GET /api/projects
 */
export async function searchProjects(
  request: ProjectSearchRequest = {}
): Promise<PageResponse<Project>> {
  const response = await api.get<
    ApiResponse<PageResponse<Project>>
  >(
    "/projects",
    {
      params: {
        page: request.page ?? 0,
        size: request.size ?? 10,
        keyword: request.keyword,
        scope: request.scope ?? "ALL",
        status: request.status,
        ownerId: request.ownerId,
        sortBy: request.sortBy ?? "createdAt",
        sortOrder: request.sortOrder ?? "desc",
      },
    }
  )

  return response.data.data
}

/**
 * Update project details.
 *
 * PUT /api/projects/update/details
 */
export async function updateProjectDetails(
  request: UpdateProjectDetailsRequest
): Promise<Project> {
  const response = await api.put<ApiResponse<Project>>(
    "/projects/update/details",
    {
      id: request.id,
      name: request.name,
      description: request.description,
      projectStatus: request.projectStatus,
      dueDate: request.dueDate,
    }
  )

  return response.data.data
}

/**
 * Update project owner.
 *
 * PUT /api/projects/update/owner
 */
export async function updateProjectOwner(
  request: UpdateProjectOwnerRequest
): Promise<Project> {
  const response = await api.put<ApiResponse<Project>>(
    "/projects/update/owner",
    {
      id: request.id,
      ownerId: request.ownerId,
    }
  )

  return response.data.data
}

/**
 * Delete project.
 *
 * DELETE /api/projects/delete
 */
export async function deleteProject(
  request: DeleteProjectRequest
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    "/projects/delete",
    {
      data: {
        id: request.id,
      },
    }
  )

  return response.data.data
}
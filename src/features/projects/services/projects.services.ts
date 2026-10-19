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
  const scope = request.scope ?? "ALL"

  // When scope is "ALL", fetch both OWNED and SHARED projects and combine them
  if (scope === "ALL") {
    const page = request.page ?? 0
    const size = request.size ?? 10
    const fetchLimit = Math.max(100, (page + 1) * size * 2)

    const [ownedRes, sharedRes] = await Promise.all([
      api.get<ApiResponse<PageResponse<Project>>>("/projects", {
        params: {
          page: 0,
          size: fetchLimit,
          keyword: request.keyword,
          scope: "OWNED",
          status: request.status,
          ownerId: request.ownerId,
          sortBy: request.sortBy ?? "createdAt",
          sortOrder: request.sortOrder ?? "desc",
        },
      }),
      api.get<ApiResponse<PageResponse<Project>>>("/projects", {
        params: {
          page: 0,
          size: fetchLimit,
          keyword: request.keyword,
          scope: "SHARED",
          status: request.status,
          ownerId: request.ownerId,
          sortBy: request.sortBy ?? "createdAt",
          sortOrder: request.sortOrder ?? "desc",
        },
      }),
    ])

    const ownedList = ownedRes.data?.data?.content ?? []
    const sharedList = sharedRes.data?.data?.content ?? []

    // Deduplicate by project id
    const projectMap = new Map<string, Project>()
    ownedList.forEach((p) => projectMap.set(p.id, p))
    sharedList.forEach((p) => {
      if (!projectMap.has(p.id)) {
        projectMap.set(p.id, p)
      }
    })

    const combined = Array.from(projectMap.values())

    // Sort combined projects based on requested sortBy and sortOrder
    const sortBy = request.sortBy ?? "createdAt"
    const sortOrder = request.sortOrder ?? "desc"

    combined.sort((a, b) => {
      let valA: string | number = (a as unknown as Record<string, string | number>)[sortBy] ?? ""
      let valB: string | number = (b as unknown as Record<string, string | number>)[sortBy] ?? ""

      if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "startDate" || sortBy === "dueDate") {
        const timeA = new Date(valA).getTime() || 0
        const timeB = new Date(valB).getTime() || 0
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }

      return 0
    })

    const totalElements = combined.length
    const totalPages = Math.ceil(totalElements / size) || 1
    const startIndex = page * size
    const pagedContent = combined.slice(startIndex, startIndex + size)

    return {
      content: pagedContent,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
    }
  }

  const response = await api.get<
    ApiResponse<PageResponse<Project>>
  >(
    "/projects",
    {
      params: {
        page: request.page ?? 0,
        size: request.size ?? 10,
        keyword: request.keyword,
        scope,
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
import api from "@/config/api"

import type {
  ApiResponse,
  CreateProjectMemberRequest,
  DeleteProjectMemberRequest,
  GetProjectMemberByIdRequest,
  GetProjectMembersRequest,
  GetUserProjectMembersRequest,
  PageResponse,
  ProjectMember,
  UpdateProjectMemberRoleRequest,
} from "../types/project.types"

export async function createProjectMember(
  request: CreateProjectMemberRequest
): Promise<ProjectMember> {
  const response = await api.post<ApiResponse<ProjectMember>>(
    "/project-member/create",
    {
      projectId: request.projectId,
      projectMemberId: request.projectMemberId,
      projectRole: request.projectRole,
    }
  )

  return response.data.data
}

export async function getProjectMemberById(
  request: GetProjectMemberByIdRequest
): Promise<ProjectMember> {
  const response = await api.get<ApiResponse<ProjectMember>>(
    "/project-member/id",
    {
      params: {
        id: request.id,
      },
    }
  )

  return response.data.data
}

export async function getProjectMembers(
  request: GetProjectMembersRequest
): Promise<PageResponse<ProjectMember>> {
  const response = await api.get<
    ApiResponse<PageResponse<ProjectMember>>
  >("/project-member/project", {
    params: {
      id: request.projectId,
      page: request.page ?? 0,
      size: request.size ?? 10,
    },
  })

  return response.data.data
}

export async function getUserProjectMembers(
  request: GetUserProjectMembersRequest
): Promise<PageResponse<ProjectMember>> {
  const response = await api.get<
    ApiResponse<PageResponse<ProjectMember>>
  >("/project-member/member", {
    params: {
      id: request.userId,
      page: request.page ?? 0,
      size: request.size ?? 10,
    },
  })

  return response.data.data
}

export async function updateProjectMemberRole(
  request: UpdateProjectMemberRoleRequest
): Promise<ProjectMember> {
  const response = await api.put<ApiResponse<ProjectMember>>(
    "/project-member/update-role",
    {
      id: request.id,
      projectRole: request.projectRole,
    }
  )

  return response.data.data
}

export async function deleteProjectMember(
  request: DeleteProjectMemberRequest
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    "/project-member/remove",
    {
      data: {
        id: request.id,
      },
    }
  )

  return response.data.data
}
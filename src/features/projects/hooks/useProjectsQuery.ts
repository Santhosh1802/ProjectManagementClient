import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createProject,
  deleteProject,
  getProjectById,
  searchProjects,
  updateProjectDetails,
  updateProjectOwner,
} from "../services/projects.services"
import {
  createProjectMember,
  deleteProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
} from "../services/project.members.service"
import type {
  CreateProjectMemberRequest,
  CreateProjectRequest,
  DeleteProjectMemberRequest,
  DeleteProjectRequest,
  GetProjectMembersRequest,
  ProjectSearchRequest,
  UpdateProjectDetailsRequest,
  UpdateProjectMemberRoleRequest,
  UpdateProjectOwnerRequest,
} from "../types/project.types"
import { projectKeys } from "@/lib/queryKeys"

export function useProjectsQuery(request: ProjectSearchRequest = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.list(request),
    queryFn: () => searchProjects(request),
    enabled: options?.enabled ?? true,
  })
}

export function useProjectDetailQuery(id: string | number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => getProjectById({ id: String(id) }),
    enabled: Boolean(id) && (options?.enabled ?? true),
  })
}

export function useProjectMembersQuery(request: GetProjectMembersRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...projectKeys.members(request.projectId), request.page ?? 0, request.size ?? 10],
    queryFn: () => getProjectMembers(request),
    enabled: Boolean(request.projectId) && (options?.enabled ?? true),
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateProjectRequest) => createProject(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProjectDetailsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateProjectDetailsRequest) => updateProjectDetails(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) })
      }
    },
  })
}

export function useUpdateProjectOwnerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateProjectOwnerRequest) => updateProjectOwner(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) })
      }
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: DeleteProjectRequest) => deleteProject(request),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      if (variables?.id) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
      }
    },
  })
}

export function useCreateProjectMemberMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateProjectMemberRequest) => createProjectMember(request),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.projectId) })
    },
  })
}

export function useUpdateProjectMemberRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateProjectMemberRoleRequest) => updateProjectMemberRole(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProjectMemberMutation(projectId?: string | number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: DeleteProjectMemberRequest) => deleteProjectMember(request),
    onSuccess: () => {
      if (projectId) {
        void queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) })
      } else {
        void queryClient.invalidateQueries({ queryKey: projectKeys.all })
      }
    },
  })
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import {
  ACTIVE_WORKSPACE_STORAGE_KEY,
  setWorkspaces,
  setActiveWorkspace,
} from "../slice/workspaceSlice"
import {
  getWorkspaces,
  getWorkspaceById,
  createOrganization,
  updateWorkspace,
  getWorkspaceMembers,
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  transferOwnership,
} from "../services/workspace.service"
import type {
  CreateOrganizationRequest,
  UpdateWorkspaceRequest,
  InviteMemberRequest,
  AcceptInvitationRequest,
  UpdateMemberRoleRequest,
  TransferOwnershipRequest,
  Workspace,
} from "../types/workspace.types"

export const WORKSPACE_KEYS = {
  all: ["workspaces"] as const,
  detail: (id?: string) => ["workspaces", id] as const,
  members: (id?: string) => ["workspace-members", id] as const,
}

export function useWorkspacesQuery(enabled = true) {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const currentUserId = useAppSelector((state) => state.auth?.user?.id ?? null)

  return useQuery({
    queryKey: WORKSPACE_KEYS.all,
    queryFn: async () => {
      const previousActiveId = (() => {
        try {
          return localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
        } catch {
          return null
        }
      })()

      const data = await getWorkspaces()
      dispatch(setWorkspaces({ workspaces: data, userId: currentUserId }))

      const nextActiveId = (() => {
        try {
          return localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY)
        } catch {
          return null
        }
      })()

      if (nextActiveId && nextActiveId !== previousActiveId) {
        queryClient.invalidateQueries({ queryKey: ["projects"] })
        queryClient.invalidateQueries({ queryKey: ["tasks"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        queryClient.invalidateQueries({ queryKey: ["analytics"] })
        queryClient.invalidateQueries({ queryKey: ["saved-views"] })
        queryClient.invalidateQueries({ queryKey: ["workflow-rules"] })
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
      }

      return data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}

export function useWorkspaceDetailQuery(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.detail(workspaceId),
    queryFn: () => getWorkspaceById(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}

export function useWorkspaceMembersQuery(workspaceId?: string) {
  return useQuery({
    queryKey: WORKSPACE_KEYS.members(workspaceId),
    queryFn: () => getWorkspaceMembers(workspaceId!),
    enabled: Boolean(workspaceId),
  })
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => createOrganization(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      dispatch(setActiveWorkspace(newWorkspace))
    },
  })
}

export function useUpdateWorkspaceMutation(workspaceId: string) {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => updateWorkspace(workspaceId, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.detail(workspaceId) })
      dispatch(setActiveWorkspace(updated))
    },
  })
}

export function useInviteMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteMemberRequest) => inviteMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) })
    },
  })
}

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: AcceptInvitationRequest) => acceptInvitation(data),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      dispatch(setActiveWorkspace(workspace))
    },
  })
}

export function useUpdateMemberRoleMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRoleRequest }) =>
      updateMemberRole(workspaceId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) })
    },
  })
}

export function useRemoveMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all })
    },
  })
}

export function useTransferOwnershipMutation(workspaceId: string) {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: TransferOwnershipRequest) => transferOwnership(workspaceId, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_KEYS.members(workspaceId) })
      dispatch(setActiveWorkspace(updated))
    },
  })
}

/**
 * Custom hook to safely switch workspace and clear tenant-scoped query caches.
 */
export function useSwitchWorkspace() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return (targetWorkspace: Workspace) => {
    // Invalidate and cancel in-flight queries to prevent cross-workspace cache pollution
    queryClient.cancelQueries()
    queryClient.invalidateQueries({ queryKey: ["projects"] })
    queryClient.invalidateQueries({ queryKey: ["tasks"] })
    queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    queryClient.invalidateQueries({ queryKey: ["analytics"] })
    queryClient.invalidateQueries({ queryKey: ["saved-views"] })
    queryClient.invalidateQueries({ queryKey: ["workflow-rules"] })
    queryClient.invalidateQueries({ queryKey: ["notifications"] })

    dispatch(setActiveWorkspace(targetWorkspace))
  }
}

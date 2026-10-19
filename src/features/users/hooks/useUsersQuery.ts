import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUserOwnedProjects,
  searchUsers,
  updateUser,
  updateUserPassword,
} from "../services/users.service"
import type {
  CreateUserRequest,
  DeleteUser,
  PasswordForm,
  UserDetails,
  UserSearchRequest,
} from "../types/user.types"
import { userKeys } from "@/lib/queryKeys"

export function useUsersQuery(request: UserSearchRequest = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.list(request),
    queryFn: () => searchUsers(request),
    enabled: options?.enabled ?? true,
  })
}

export function useUserDetailQuery(id: string | number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => getUserById({ id: String(id) }),
    enabled: Boolean(id) && (options?.enabled ?? true),
  })
}

export function useUserByEmailQuery(email: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...userKeys.all, "by-email", email ?? ""],
    queryFn: () => getUserByEmail({ email: email ?? "" }),
    enabled: Boolean(email) && (options?.enabled ?? true),
  })
}

export function useUserOwnedProjectsQuery(userId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...userKeys.all, "owned-projects", userId ?? ""],
    queryFn: () => getUserOwnedProjects({ id: userId ?? "" }),
    enabled: Boolean(userId) && (options?.enabled ?? true),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateUserRequest) => createUser(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UserDetails) => updateUser(request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      if (data?.id) {
        void queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) })
      }
    },
  })
}

export function useUpdateUserPasswordMutation() {
  return useMutation({
    mutationFn: (request: PasswordForm) => updateUserPassword(request),
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: DeleteUser) => deleteUser(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

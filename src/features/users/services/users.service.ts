
import api from "@/config/api"

import type {
  ApiResponse,
  CreateUserRequest,
  DeleteUser,
  PageResponse,
  PasswordForm,
  User,
  UserByEmail,
  UserById,
  UserDetails,
  UserOwnedProjects,
  UserSearchRequest,
} from "../types/user.types"

/**
 * Create a user.
 * POST /api/users/create
 */
export async function createUser(
  request: CreateUserRequest
): Promise<User> {
  const response = await api.post<ApiResponse<User>>(
    "/users/create",
    request
  )

  return response.data.data
}

/**
 * Get user by email.
 * GET /api/users/email?email={email}
 */
export async function getUserByEmail(
  request: UserByEmail
): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/users/email", {
    params: {
      email: request.email,
    },
  })

  return response.data.data
}

/**
 * Get user by ID.
 * GET /api/users/id?id={id}
 */
export async function getUserById(
  request: UserById
): Promise<User> {
  const response = await api.get<ApiResponse<User>>("/users/id", {
    params: {
      id: request.id,
    },
  })

  return response.data.data
}

/**
 * Search users with pagination, filters, and sorting.
 * GET /api/users/all
 */
export async function searchUsers(
  request: UserSearchRequest = {}
): Promise<PageResponse<User>> {
  const response = await api.get<
    ApiResponse<PageResponse<User>>
  >("/users/all", {
    params: {
      page: request.page ?? 0,
      size: request.size ?? 10,
      keyword: request.keyword,
      role: request.role,
      isActive: request.isActive,
      emailVerified: request.emailVerified,
      sortBy: request.sortBy ?? "createdAt",
      sortOrder: request.sortOrder ?? "desc",
    },
  })

  return response.data.data
}

/**
 * Update a user's profile.
 * PUT /api/users/profile
 */
export async function updateUser(
  request: UserDetails
): Promise<User> {
  const response = await api.put<ApiResponse<User>>(
    "/users/profile",
    {
      id: request.id,
      firstName: request.firstName,
      lastName: request.lastName ?? "",
      email: request.email,
    }
  )

  return response.data.data
}

/**
 * Update a user's password.
 * PUT /api/users/password
 */
export async function updateUserPassword(
  request: PasswordForm
): Promise<User> {
  const response = await api.put<ApiResponse<User>>(
    "/users/password",
    {
      id: request.id,
      oldPassword: request.oldPassword,
      newPassword: request.newPassword,
    }
  )

  return response.data.data
}

/**
 * Delete a user.
 * DELETE /api/users/delete
 */
export async function deleteUser(
  request: DeleteUser
): Promise<boolean> {
  const response = await api.delete<ApiResponse<boolean>>(
    "/users/delete",
    {
      data: {
        id: request.id,
      },
    }
  )

  return response.data.data
}

/**
 * Get projects owned by a user.
 * GET /api/users/owned/projects?id={id}
 */
export async function getUserOwnedProjects(
  request: UserById
): Promise<UserOwnedProjects> {
  const response = await api.get<
    ApiResponse<UserOwnedProjects>
  >("/users/owned/projects", {
    params: {
      id: request.id,
    },
  })

  return response.data.data
}


import type { Project } from "@/features/projects/types/project.types"

/* -------------------- API Response Types -------------------- */

export interface ApiResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

/* -------------------- Roles -------------------- */

export type UserRole = "ADMIN" | "MANAGER" | "USER"

/* -------------------- Request Types -------------------- */

export interface CreateUserRequest {
  firstName: string
  lastName?: string
  email: string
  password: string
  role: UserRole
}

export interface UserByEmail {
  email: string
}

export interface UserById {
  id: string
}

export interface UserSearchRequest {
  page?: number
  size?: number
  keyword?: string
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
  sortBy?: "createdAt" | "firstName" | "lastName" | "email" | "updatedAt" | "lastLoginAt"
  sortOrder?: "asc" | "desc"
}

export interface PasswordForm {
  id: string
  oldPassword: string
  newPassword: string
}

export interface DeleteUser {
  id: string
}

export interface UserDetails {
  id: string
  firstName: string
  lastName?: string
  email: string
}

/* -------------------- Response Types -------------------- */

export interface User {
  id: string
  firstName: string
  lastName: string | null
  email: string
  userRole: UserRole
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

/* -------------------- Owned Projects -------------------- */

export interface UserOwnedProjects {
  id: string
  ownedProjects: Project[]
}

export type UserStatus = "all" | "active" | "inactive";
export type VerificationStatus = "all" | "verified" | "unverified";
export type UserView = "card" | "list" | "table";

export type SortField =
  | "createdAt"
  | "firstName"
  | "lastName"
  | "email"
  | "lastLoginAt";

export type SortOrder = "asc" | "desc";
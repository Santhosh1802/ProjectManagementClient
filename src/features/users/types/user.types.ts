export type UserByEmail = {
  email: string
}
export type UserById = {
  id: string
}

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  userRole: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string
}

export type PasswordForm = {
  id: string
  oldPassword: string
  newPassword: string
}

export type DeleteUser = {
  id: string
}

export type UserDetails = {
  id: string
  firstName: string
  lastName: string
  email: string
}
import api from "@/config/api"
import type {
  DeleteUser,
  PasswordForm,
  UserByEmail,
  UserById,
  UserDetails,
} from "../types/user.types"

export async function getUserByEmail(request: UserByEmail) {
  const response = await api.get(`/users/email`, {
    params: {
      email: request.email,
    },
  })
  return response
}

export async function getUserById(request: UserById) {
  const response = await api.get(`/users/id`, {
    params: {
      id: request.id,
    },
  })
  return response
}

export async function updateUser(request: UserDetails) {
  const response = await api.put("/users/profile", {
    id: request.id,
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
  })
  return response
}
export async function updateUserPassword(request: PasswordForm) {
  const response = await api.put("/users/password", {
    id: request.id,
    oldPassword: request.oldPassword,
    newPassword: request.newPassword,
  })
  return response
}

export async function deleteUser(request: DeleteUser) {
  const response = await api.delete("/users/delete", { data: request })
  return response
}

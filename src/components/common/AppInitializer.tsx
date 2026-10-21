import { useEffect } from "react"

import { useAppDispatch } from "@/hooks/redux-hooks"
import {
  logout,
  setAuthLoading,
  setAuthUser,
  type AuthUser,
} from "@/features/auth/slice/authSlice"

import { isLoggedIn } from "@/features/auth/services/auth.service"
import { queryClient } from "@/lib/queryClient"
import { clearUser } from "@/features/users/slice/user.slice"
import { clearProjects } from "@/features/projects/slice/projectSlice"
import { clearTasks } from "@/features/tasks/slice/task.slice"
import { clearProjectMembers } from "@/features/projects/slice/projectMemberSlice"
export default function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await isLoggedIn()
        const user = response.data?.data

        if (user) {
          const authUser: AuthUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName ?? "",
            email: user.email,
            user_role: user.userRole,
          }
          dispatch(setAuthUser(authUser))
        } else {
          queryClient.cancelQueries()
          queryClient.clear()
          dispatch(logout())
          dispatch(clearUser())
          dispatch(clearProjects())
          dispatch(clearTasks())
          dispatch(clearProjectMembers())
        }
      } catch (error) {
        // Not logged in or session expired
        queryClient.cancelQueries()
        queryClient.clear()
        dispatch(logout())
        dispatch(clearUser())
        dispatch(clearProjects())
        dispatch(clearTasks())
        dispatch(clearProjectMembers())
      } finally {
        dispatch(setAuthLoading(false))
      }
    }

    checkAuthentication()
  }, [dispatch])

  return null
}

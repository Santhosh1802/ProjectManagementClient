import { useEffect } from "react"

import { useAppDispatch } from "@/hooks/redux-hooks"
import {
  setAuthLoading,
  setAuthenticated,
  setNotAuthenticated,
} from "@/features/auth/slice/authSlice"

import { isLoggedIn } from "@/features/auth/services/auth.service"

export default function AuthInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticated = await isLoggedIn()
        if (isAuthenticated.data.data === true) {
          dispatch(setAuthenticated())
        } else {
          dispatch(setNotAuthenticated())
        }
      } catch (error) {
        console.log(error);
        dispatch(setNotAuthenticated());
      } finally {
        dispatch(setAuthLoading(false))
      }
    }

    checkAuthentication()
  }, [dispatch])

  return null
}

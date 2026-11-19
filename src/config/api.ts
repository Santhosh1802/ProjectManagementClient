import axios from "axios"

import { API } from "./config"

import {
  setBackendAvailable,
  setBackendUnAvailable,
} from "@/app/slice/appSlice"
import { store } from "@/app/store"
import { clearWorkspaces } from "@/features/workspaces/slice/workspaceSlice"
import { queryClient } from "@/lib/queryClient"

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
})

let csrfToken: string | null = null

const getCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken
  }

  const response = await api.get("/auth/csrf")

  csrfToken = response.data.token

  return csrfToken
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()

  const requiresCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method ?? "")

  if (requiresCsrf && config.url !== "/auth/csrf") {
    const token = await getCsrfToken()

    config.headers.set("X-XSRF-TOKEN", token)
  }

  const activeWorkspaceId =
    store.getState().workspaces?.activeWorkspace?.id ??
    localStorage.getItem("devflow_active_workspace_id")

  if (activeWorkspaceId) {
    config.headers.set("X-Workspace-Id", activeWorkspaceId)
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    // Backend responded → server is available
    store.dispatch(setBackendAvailable())
    return response
  },

  (error) => {
    // Request reached no server
    if (error.code === "ERR_NETWORK") {
      store.dispatch(setBackendUnAvailable())
    } else {
      store.dispatch(setBackendAvailable())
    }

    // Self-heal if localStorage/Redux holds a stale workspace ID (e.g. after DB reset or workspace deletion)
    if (
      error.response?.status === 404 &&
      error.response?.data?.error === "Workspace Not Found" &&
      error.config &&
      !error.config._workspaceRetried
    ) {
      error.config._workspaceRetried = true
      store.dispatch(clearWorkspaces())
      localStorage.removeItem("devflow_active_workspace_id")
      if (error.config.headers) {
        delete error.config.headers["X-Workspace-Id"]
      }
      return api.request(error.config)
    }

    // When session expires (401), and request is not the login or check endpoint itself
    if (
      error.response?.status === 401 &&
      error.config?.url &&
      !error.config.url.includes("/auth/login") &&
      !error.config.url.includes("/auth/me")
    ) {
      // Avoid infinite loop if /me or /login itself returns 401
      store.dispatch(clearWorkspaces())
      queryClient.cancelQueries()
      queryClient.clear()
    }

    return Promise.reject(error)
  }
)

export default api

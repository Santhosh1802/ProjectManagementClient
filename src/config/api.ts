import axios from "axios"

import { API } from "./config"

import {
  setBackendAvailable,
  setBackendUnAvailable,
} from "@/app/slice/appSlice"
import { store } from "@/app/store"

const api = axios.create({
  baseURL: API,
  withCredentials: true,
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

    return Promise.reject(error)
  }
)

export default api

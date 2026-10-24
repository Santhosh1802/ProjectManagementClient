export const API: string = import.meta.env.VITE_BACKEND_URL || "/api"

export const getWebSocketUrl = (): string => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (backendUrl) {
    // If backend is e.g. https://api.example.com/api -> https://api.example.com/ws
    return backendUrl.replace(/\/api\/?$/, "") + "/ws"
  }
  return "/ws"
}


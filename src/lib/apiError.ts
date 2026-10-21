import axios, { AxiosError } from "axios"

export interface ApiErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  errors?: Array<{
    field?: string
    message?: string
  }>
}

/**
 * Maps HTTP status codes and API error response payloads to user-friendly messages.
 * Prevents internal server stack traces or raw technical errors from leaking directly to UI.
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (!error) {
    return fallbackMessage
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>

    // Network level failure
    if (axiosError.code === "ERR_NETWORK" || !axiosError.response) {
      return "Unable to connect to the server. Please check your internet connection."
    }

    const status = axiosError.response.status
    const data = axiosError.response.data

    // If backend returned specific validation errors array
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      const firstValidError = data.errors.find((e) => e.message)
      if (firstValidError?.message) {
        return firstValidError.message
      }
    }

    // Backend custom error message
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      // Filter out raw SQL or stack traces if any
      const rawMsg = data.message.trim()
      if (
        !rawMsg.toLowerCase().includes("sql") &&
        !rawMsg.toLowerCase().includes("hibernate") &&
        !rawMsg.toLowerCase().includes("exception") &&
        rawMsg.length < 200
      ) {
        return rawMsg
      }
    }

    // HTTP Status based user-friendly messages
    switch (status) {
      case 400:
        return "The request was invalid. Please check your input and try again."
      case 401:
        return "Your session has expired. Please sign in again."
      case 403:
        return "You do not have permission to perform this action."
      case 404:
        return "The requested resource could not be found."
      case 409:
        return data?.message || "A conflict occurred with an existing resource."
      case 422:
        return "Unprocessable request. Please check the provided values."
      case 429:
        return "Too many requests. Please wait a moment and try again."
      case 500:
      case 502:
      case 503:
      case 504:
        return "The server encountered an error. Please try again later."
      default:
        return fallbackMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

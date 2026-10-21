import { describe, it, expect } from "vitest"
import { getApiErrorMessage } from "../lib/apiError"
import { AxiosError } from "axios"

describe("getApiErrorMessage", () => {
  it("returns fallback message when error is null or undefined", () => {
    expect(getApiErrorMessage(null)).toBe("An unexpected error occurred. Please try again.")
    expect(getApiErrorMessage(undefined, "Custom fallback")).toBe("Custom fallback")
  })

  it("handles network connection errors", () => {
    const error = new AxiosError("Network Error")
    error.code = "ERR_NETWORK"

    const message = getApiErrorMessage(error)
    expect(message).toBe("Unable to connect to the server. Please check your internet connection.")
  })

  it("handles 401 Unauthorized status with friendly copy", () => {
    const error = new AxiosError("Unauthorized")
    error.response = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {} as any,
      data: {},
    }

    const message = getApiErrorMessage(error)
    expect(message).toBe("Your session has expired. Please sign in again.")
  })

  it("handles 403 Forbidden status", () => {
    const error = new AxiosError("Forbidden")
    error.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as any,
      data: {},
    }

    const message = getApiErrorMessage(error)
    expect(message).toBe("You do not have permission to perform this action.")
  })

  it("extracts field-specific validation errors when returned in data.errors", () => {
    const error = new AxiosError("Bad Request")
    error.response = {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
      data: {
        errors: [{ field: "email", message: "Invalid email format" }],
      },
    }

    const message = getApiErrorMessage(error)
    expect(message).toBe("Invalid email format")
  })

  it("masks raw SQL or technical database errors with friendly 500 error", () => {
    const error = new AxiosError("Internal Server Error")
    error.response = {
      status: 500,
      statusText: "Internal Server Error",
      headers: {},
      config: {} as any,
      data: {
        message: "org.hibernate.exception.ConstraintViolationException: could not execute statement",
      },
    }

    const message = getApiErrorMessage(error)
    expect(message).toBe("The server encountered an error. Please try again later.")
  })
})

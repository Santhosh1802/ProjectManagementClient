import { describe, it, expect } from "vitest"
import authReducer, {
  setAuthUser,
  setAuthenticated,
  setNotAuthenticated,
  logout,
  setAuthLoading,
  type AuthUser,
} from "./authSlice"

describe("authSlice", () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  }

  const mockUser: AuthUser = {
    id: "user-123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    user_role: "ADMIN",
  }

  it("returns the initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState)
  })

  it("handles setAuthUser", () => {
    const nextState = authReducer(initialState, setAuthUser(mockUser))
    expect(nextState.user).toEqual(mockUser)
    expect(nextState.isAuthenticated).toBe(true)
    expect(nextState.isLoading).toBe(false)
  })

  it("handles setAuthenticated", () => {
    const nextState = authReducer(initialState, setAuthenticated())
    expect(nextState.isAuthenticated).toBe(true)
  })

  it("handles setNotAuthenticated", () => {
    const loggedInState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    }
    const nextState = authReducer(loggedInState, setNotAuthenticated())
    expect(nextState.isAuthenticated).toBe(false)
    expect(nextState.user).toEqual(mockUser)
  })

  it("handles logout", () => {
    const loggedInState = {
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    }
    const nextState = authReducer(loggedInState, logout())
    expect(nextState.user).toBeNull()
    expect(nextState.isAuthenticated).toBe(false)
    expect(nextState.isLoading).toBe(false)
  })

  it("handles setAuthLoading", () => {
    const nextState = authReducer(initialState, setAuthLoading(false))
    expect(nextState.isLoading).toBe(false)
  })
})

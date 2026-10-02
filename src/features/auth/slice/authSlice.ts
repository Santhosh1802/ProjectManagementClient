import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  user_role: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
    },
    setAuthenticated: (state) => {
      state.isAuthenticated = true
    },
    setNotAuthenticated: (state) => {
      state.isAuthenticated = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setAuthUser,
  setAuthenticated,
  setNotAuthenticated,
  logout,
  setAuthLoading,
} = authSlice.actions

export default authSlice.reducer

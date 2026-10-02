import { createSlice } from "@reduxjs/toolkit"

interface AppState {
  isBackendAvailable: boolean
}

const initialState: AppState = {
  isBackendAvailable: true,
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setBackendAvailable: (state) => {
      state.isBackendAvailable = true
    },
    setBackendUnAvailable: (state) => {
      state.isBackendAvailable = false
    },
  },
})

export const { setBackendAvailable, setBackendUnAvailable } = appSlice.actions

export default appSlice.reducer

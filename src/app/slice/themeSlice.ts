import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ThemeColorKey } from "@/config/themeColors"

export type Theme = "dark" | "light" | "system"
export type ColorTheme = "zinc" | "slate" | "indigo" | "emerald" | "rose"

interface ThemeState {
  theme: Theme
  colorTheme: ColorTheme
  primaryColor: ThemeColorKey
  secondaryColor: ThemeColorKey
}

const initialState: ThemeState = {
  theme: "system",
  colorTheme: "indigo",
  primaryColor: "indigo",
  secondaryColor: "teal",
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },
    setColorTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.colorTheme = action.payload
    },
    setPrimaryColor: (state, action: PayloadAction<ThemeColorKey>) => {
      state.primaryColor = action.payload
    },
    setSecondaryColor: (state, action: PayloadAction<ThemeColorKey>) => {
      state.secondaryColor = action.payload
    },
  },
})

export const { setTheme, setColorTheme, setPrimaryColor, setSecondaryColor } =
  themeSlice.actions

export default themeSlice.reducer

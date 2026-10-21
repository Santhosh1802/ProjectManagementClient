import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light" | "system";
export type ColorTheme = "zinc" | "slate" | "indigo" | "emerald" | "rose";

interface ThemeState {
  theme: Theme;
  colorTheme: ColorTheme;
}

const initialState: ThemeState = {
  theme: "system",
  colorTheme: "indigo",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setColorTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.colorTheme = action.payload;
    },
  },
});

export const { setTheme, setColorTheme } = themeSlice.actions;

export default themeSlice.reducer;
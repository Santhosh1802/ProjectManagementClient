import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light" | "system";

interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: "system",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;
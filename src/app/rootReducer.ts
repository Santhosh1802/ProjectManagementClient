import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../features/auth/slice/authSlice"
import themeReducer from "./slice/themeSlice"
import appReducer from "./slice/appSlice"
const rootReducer = combineReducers({
  app: appReducer,
  theme: themeReducer,
  auth: authReducer,
})

export default rootReducer

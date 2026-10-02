import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../features/auth/slice/authSlice"
import themeReducer from "./slice/themeSlice"
import appReducer from "./slice/appSlice"
import userReducer from "../features/users/slice/user.slice"
const rootReducer = combineReducers({
  app: appReducer,
  theme: themeReducer,
  auth: authReducer,
  user: userReducer,
})

export default rootReducer

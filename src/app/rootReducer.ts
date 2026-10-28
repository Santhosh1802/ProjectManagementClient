import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../features/auth/slice/authSlice"
import themeReducer from "./slice/themeSlice"
import appReducer from "./slice/appSlice"
import userReducer from "../features/users/slice/user.slice"
import projectReducer from "@/features/projects/slice/projectSlice"
import taskReducer from "@/features/tasks/slice/task.slice"
import projectMemberReducer from "@/features/projects/slice/projectMemberSlice"
import workspaceReducer from "@/features/workspaces/slice/workspaceSlice"

const rootReducer = combineReducers({
  app: appReducer,
  theme: themeReducer,
  auth: authReducer,
  user: userReducer,
  project: projectReducer,
  projectMember: projectMemberReducer,
  task: taskReducer,
  workspaces: workspaceReducer,
})

export default rootReducer

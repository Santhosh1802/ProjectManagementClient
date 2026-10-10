import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  PageResponse,
  ProjectMember,
} from "../types/project.types"

interface ProjectMemberState {
  members: ProjectMember[]

  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean

  loading: boolean
  error: string | null
}

const initialState: ProjectMemberState = {
  members: [],

  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,

  loading: false,
  error: null,
}

const projectMemberSlice = createSlice({
  name: "projectMember",

  initialState,

  reducers: {
    setProjectMembers: (
      state,
      action: PayloadAction<PageResponse<ProjectMember>>
    ) => {
      const pageResponse = action.payload

      state.members = pageResponse.content
      state.page = pageResponse.page
      state.size = pageResponse.size
      state.totalElements = pageResponse.totalElements
      state.totalPages = pageResponse.totalPages
      state.first = pageResponse.first
      state.last = pageResponse.last
    },

    addProjectMember: (
      state,
      action: PayloadAction<ProjectMember>
    ) => {
      state.members.unshift(action.payload)
      state.totalElements += 1
    },

    updateProjectMember: (
      state,
      action: PayloadAction<ProjectMember>
    ) => {
      const index = state.members.findIndex(
        (member) => member.id === action.payload.id
      )

      if (index !== -1) {
        state.members[index] = action.payload
      }
    },

    removeProjectMember: (
      state,
      action: PayloadAction<string>
    ) => {
      state.members = state.members.filter(
        (member) => member.id !== action.payload
      )

      if (state.totalElements > 0) {
        state.totalElements -= 1
      }
    },

    setProjectMemberPage: (
      state,
      action: PayloadAction<number>
    ) => {
      state.page = action.payload
    },

    setProjectMemberPageSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.size = action.payload
    },

    setProjectMemberLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload
    },

    setProjectMemberError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload
    },

    clearProjectMemberError: (state) => {
      state.error = null
    },

    clearProjectMembers: (state) => {
      state.members = []
      state.page = 0
      state.totalElements = 0
      state.totalPages = 0
      state.first = true
      state.last = true
      state.error = null
    },
  },
})

export const {
  setProjectMembers,
  addProjectMember,
  updateProjectMember,
  removeProjectMember,
  setProjectMemberPage,
  setProjectMemberPageSize,
  setProjectMemberLoading,
  setProjectMemberError,
  clearProjectMemberError,
  clearProjectMembers,
} = projectMemberSlice.actions

export default projectMemberSlice.reducer
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  PageResponse,
  Project,
} from "../types/project.types"

interface ProjectState {
  projects: Project[]
  selectedProject: Project | null

  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean

  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,

  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,

  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: "project",

  initialState,

  reducers: {
    /**
     * Set projects from a paginated API response.
     */
    setProjects: (
      state,
      action: PayloadAction<PageResponse<Project>>
    ) => {
      const pageResponse = action.payload

      state.projects = pageResponse.content
      state.page = pageResponse.page
      state.size = pageResponse.size
      state.totalElements = pageResponse.totalElements
      state.totalPages = pageResponse.totalPages
      state.first = pageResponse.first
      state.last = pageResponse.last
    },

    /**
     * Set the currently selected project.
     */
    setSelectedProject: (
      state,
      action: PayloadAction<Project | null>
    ) => {
      state.selectedProject = action.payload
    },

    /**
     * Add a newly created project.
     */
    addProject: (
      state,
      action: PayloadAction<Project>
    ) => {
      state.projects.unshift(action.payload)
      state.totalElements += 1
    },

    /**
     * Update an existing project.
     */
    updateProject: (
      state,
      action: PayloadAction<Project>
    ) => {
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id
      )

      if (index !== -1) {
        state.projects[index] = action.payload
      }

      if (
        state.selectedProject?.id === action.payload.id
      ) {
        state.selectedProject = action.payload
      }
    },

    /**
     * Remove a project.
     */
    removeProject: (
      state,
      action: PayloadAction<string>
    ) => {
      const exists = state.projects.some(
        (project) => project.id === action.payload
      )

      state.projects = state.projects.filter(
        (project) => project.id !== action.payload
      )

      if (exists && state.totalElements > 0) {
        state.totalElements -= 1
      }

      if (
        state.selectedProject?.id === action.payload
      ) {
        state.selectedProject = null
      }
    },

    /**
     * Update the current page.
     */
    setProjectPage: (
      state,
      action: PayloadAction<number>
    ) => {
      state.page = action.payload
    },

    /**
     * Update page size.
     */
    setProjectPageSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.size = action.payload
    },

    /**
     * Set loading state.
     */
    setProjectLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload
    },

    /**
     * Set project error.
     */
    setProjectError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload
    },

    /**
     * Clear project error.
     */
    clearProjectError: (state) => {
      state.error = null
    },

    /**
     * Clear selected project.
     */
    clearSelectedProject: (state) => {
      state.selectedProject = null
    },

    /**
     * Clear all projects and pagination state.
     */
    clearProjects: (state) => {
      state.projects = []
      state.selectedProject = null

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
  setProjects,
  setSelectedProject,
  addProject,
  updateProject,
  removeProject,
  setProjectPage,
  setProjectPageSize,
  setProjectLoading,
  setProjectError,
  clearProjectError,
  clearSelectedProject,
  clearProjects,
} = projectSlice.actions

export default projectSlice.reducer
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type {
  Task,
  TaskPageResponse,
} from "../types/task.types"

interface TaskState {
  tasks: Task[]
  selectedTask: Task | null

  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean

  loading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,

  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,

  loading: false,
  error: null,
}

const taskSlice = createSlice({
  name: "task",

  initialState,

  reducers: {
    /**
     * Set paginated tasks.
     */
    setTasks: (
      state,
      action: PayloadAction<TaskPageResponse>
    ) => {
      const pageResponse = action.payload

      state.tasks = pageResponse.content
      state.page = pageResponse.page
      state.size = pageResponse.size
      state.totalElements = pageResponse.totalElements
      state.totalPages = pageResponse.totalPages
      state.first = pageResponse.first
      state.last = pageResponse.last
    },

    /**
     * Set selected task.
     */
    setSelectedTask: (
      state,
      action: PayloadAction<Task | null>
    ) => {
      state.selectedTask = action.payload
    },

    /**
     * Add a task to the current list.
     */
    addTask: (
      state,
      action: PayloadAction<Task>
    ) => {
      state.tasks.unshift(action.payload)
      state.totalElements += 1
    },

    /**
     * Update a task in the current list.
     */
    updateTask: (
      state,
      action: PayloadAction<Task>
    ) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      )

      if (index !== -1) {
        state.tasks[index] = action.payload
      }

      if (
        state.selectedTask?.id === action.payload.id
      ) {
        state.selectedTask = action.payload
      }
    },

    /**
     * Remove a task from the current list.
     */
    removeTask: (
      state,
      action: PayloadAction<string>
    ) => {
      const exists = state.tasks.some(
        (task) => task.id === action.payload
      )

      state.tasks = state.tasks.filter(
        (task) => task.id !== action.payload
      )

      if (exists && state.totalElements > 0) {
        state.totalElements -= 1
      }

      if (
        state.selectedTask?.id === action.payload
      ) {
        state.selectedTask = null
      }
    },

    /**
     * Update current page.
     */
    setTaskPage: (
      state,
      action: PayloadAction<number>
    ) => {
      state.page = action.payload
    },

    /**
     * Update page size.
     */
    setTaskPageSize: (
      state,
      action: PayloadAction<number>
    ) => {
      state.size = action.payload
    },

    /**
     * Set loading state.
     */
    setTaskLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload
    },

    /**
     * Set error.
     */
    setTaskError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload
    },

    /**
     * Clear error.
     */
    clearTaskError: (state) => {
      state.error = null
    },

    /**
     * Clear selected task.
     */
    clearSelectedTask: (state) => {
      state.selectedTask = null
    },

    /**
     * Clear all task state.
     */
    clearTasks: (state) => {
      state.tasks = []
      state.selectedTask = null

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
  setTasks,
  setSelectedTask,
  addTask,
  updateTask,
  removeTask,
  setTaskPage,
  setTaskPageSize,
  setTaskLoading,
  setTaskError,
  clearTaskError,
  clearSelectedTask,
  clearTasks,
} = taskSlice.actions

export default taskSlice.reducer
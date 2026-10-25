export type ViewTarget = "TASKS" | "PROJECTS"

export interface SavedView {
  id: string
  name: string
  viewTarget: ViewTarget
  filtersJson: string
  sortBy?: string | null
  sortOrder?: "asc" | "desc" | null
  isDefault: boolean
  isShared: boolean
  projectId?: string | null
  projectName?: string | null
  ownerId?: string | null
  ownerName?: string | null
  isOwnedByCurrentUser: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSavedViewRequest {
  name: string
  viewTarget: ViewTarget
  filtersJson: string
  sortBy?: string | null
  sortOrder?: string | null
  isDefault?: boolean
  isShared?: boolean
  projectId?: string | null
}

export interface UpdateSavedViewRequest {
  name?: string
  filtersJson?: string
  sortBy?: string | null
  sortOrder?: string | null
  isDefault?: boolean
  isShared?: boolean
  projectId?: string | null
}

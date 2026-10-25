export interface GlobalSearchProjectItem {
  id: string
  name: string
  description?: string | null
  status?: string | null
  ownerName?: string | null
  dueDate?: string | null
}

export interface GlobalSearchTaskItem {
  id: string
  title: string
  description?: string | null
  status?: string | null
  priority?: string | null
  projectId?: string | null
  projectName?: string | null
  assignedToName?: string | null
  dueDate?: string | null
}

export interface GlobalSearchMemberItem {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string | null
}

export interface GlobalSearchCommentItem {
  id: string
  contentSnippet: string
  authorName: string
  taskId?: string | null
  taskTitle?: string | null
  projectId?: string | null
  createdAt: string
}

export interface GlobalSearchResponse {
  projects: GlobalSearchProjectItem[]
  tasks: GlobalSearchTaskItem[]
  members: GlobalSearchMemberItem[]
  comments: GlobalSearchCommentItem[]
}

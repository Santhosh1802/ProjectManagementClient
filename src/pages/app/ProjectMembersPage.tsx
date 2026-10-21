import { useEffect, useMemo, useState } from "react"

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"

import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Badge } from "@/components/ui/badge"
import StatusBadge from "@/components/common/StatusBadge"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PageSizeSelector from "@/components/common/PageSizeSelector"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import type { RootState } from "@/app/store"

import { getProjectById } from "@/features/projects/services/projects.services"

import {
  createProjectMember,
  deleteProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
} from "@/features/projects/services/project.members.service"

import { searchUsers } from "@/features/users/services/users.service"
import { getProjectPermissions } from "@/features/projects/utils/projectPermission"

import type {
  ProjectMember,
  ProjectRole,
} from "@/features/projects/types/project.types"

import type { User } from "@/features/users/types/user.types"

import { setSelectedProject } from "@/features/projects/slice/projectSlice"

import {
  addProjectMember,
  removeProjectMember,
  setProjectMemberError,
  setProjectMemberLoading,
  setProjectMemberPage,
  setProjectMemberPageSize,
  setProjectMembers,
  updateProjectMember,
} from "@/features/projects/slice/projectMemberSlice"

type RoleFilter = "ALL" | ProjectRole

function getPaginationItems(
  totalPages: number,
  currentPage: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index)
  }

  const pages = new Set<number>([
    0,
    totalPages - 1,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ])

  const visiblePages = [...pages]
    .filter((p) => p >= 0 && p < totalPages)
    .sort((a, b) => a - b)

  const result: (number | "ellipsis")[] = []

  visiblePages.forEach((p, index) => {
    if (index > 0 && p - visiblePages[index - 1] > 1) {
      result.push("ellipsis")
    }
    result.push(p)
  })

  return result
}

function getUserName(member: ProjectMember) {
  return `${member.user?.firstName ?? ""} ${member.user?.lastName ?? ""}`.trim()
}

function getUserInitials(member: ProjectMember) {
  const first = member.user?.firstName?.charAt(0) ?? ""
  const last = member.user?.lastName?.charAt(0) ?? ""

  return `${first}${last}`.toUpperCase() || "U"
}

function getUserInitialsFromUser(user: User) {
  const first = user.firstName?.charAt(0) ?? ""
  const last = user.lastName?.charAt(0) ?? ""

  return `${first}${last}`.toUpperCase() || "U"
}

function getUserNameFromUser(user: User) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
}

function formatRole(role: ProjectRole) {
  return role === "MANAGER" ? "Manager" : "Member"
}

export default function ProjectMembersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const { projectId } = useParams<{ projectId: string }>()

  const currentUser = useAppSelector((state: RootState) => state.auth.user)

  const project = useAppSelector(
    (state: RootState) => state.project.selectedProject
  )

  const { members, page, size, totalElements, totalPages, loading, error } =
    useAppSelector((state: RootState) => state.projectMember)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL")

  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("MEMBER")

  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<ProjectMember | null>(null)

  /*
   * ------------------------------------------------------------
   * Load project
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    async function loadProject() {
      try {
        const projectData = await getProjectById({
          id: projectId || "",
        })

        if (cancelled) return

        dispatch(setSelectedProject(projectData))
      } catch {
        if (!cancelled) {
          dispatch(setProjectMemberError("Unable to load project."))
        }
      }
    }

    loadProject()

    return () => {
      cancelled = true
    }
  }, [projectId, dispatch])

  /*
   * ------------------------------------------------------------
   * Load members
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    async function loadMembers() {
      try {
        dispatch(setProjectMemberLoading(true))
        dispatch(setProjectMemberError(null))

        const response = await getProjectMembers({
          projectId: projectId || "",
          page,
          size,
        })

        if (cancelled) return

        dispatch(setProjectMembers(response))
      } catch (err) {
        if (cancelled) return

        dispatch(
          setProjectMemberError(
            err instanceof Error
              ? err.message
              : "Unable to load project members."
          )
        )
      } finally {
        if (!cancelled) {
          dispatch(setProjectMemberLoading(false))
        }
      }
    }

    loadMembers()

    return () => {
      cancelled = true
    }
  }, [projectId, page, size, dispatch])

  /*
   * ------------------------------------------------------------
   * Permissions
   * ------------------------------------------------------------
   */

  const currentProjectMember = useMemo(
    () => members.find((member) => member.user?.id === currentUser?.id),
    [members, currentUser?.id],
  )

  const permissions = getProjectPermissions({
    userId: currentUser?.id ?? "",
    userRole: currentUser?.user_role ?? "",
    projectOwnerId: project?.owner?.id ?? "",
    projectRole: currentProjectMember?.projectRole,
  })

  /*
   * ------------------------------------------------------------
   * Client-side filters
   * ------------------------------------------------------------
   *
   * The current members API is paginated but the uploaded page
   * does not define server-side member search/filter parameters.
   * Therefore these filters intentionally apply to the loaded page.
   * ------------------------------------------------------------
   */

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return members.filter((member) => {
      const name = getUserName(member).toLowerCase()
      const email = member.user?.email?.toLowerCase() ?? ""

      const matchesSearch =
        !keyword || name.includes(keyword) || email.includes(keyword)

      const matchesRole =
        roleFilter === "ALL" || member.projectRole === roleFilter

      return matchesSearch && matchesRole
    })
  }, [members, search, roleFilter])

  /*
   * ------------------------------------------------------------
   * Search users for add-member dialog
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const keyword = memberSearch.trim()

    function handleExceptions() {
      if (!addMemberOpen || !keyword) {
        setSearchResults([])
        setSearchLoading(false)
        setSearchError(null)
        return
      }
    }

    handleExceptions();
    let cancelled = false

    const timeout = window.setTimeout(async () => {
      try {
        setSearchLoading(true)
        setSearchError(null)

        const response = await searchUsers({
          keyword,
          page: 0,
          size: 10,
        })

        if (cancelled) return

        const existingMemberIds = new Set(
          members.map((member) => member.user?.id)
        )

        setSearchResults(
          response.content.filter(
            (user) =>
              user.id !== currentUser?.id && !existingMemberIds.has(user.id)
          )
        )
      } catch (error) {
        if (cancelled) return

        setSearchResults([])
        setSearchError(
          error instanceof Error ? error.message : "Unable to search users."
        )
      } finally {
        if (!cancelled) {
          setSearchLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [addMemberOpen, memberSearch, members, currentUser?.id])

  /*
   * ------------------------------------------------------------
   * Change member role
   * ------------------------------------------------------------
   */

  async function handleRoleChange(memberId: string, role: ProjectRole) {
    if (!permissions.canManageMembers) return

    try {
      setActionLoading(true)
      setActionError(null)

      const updatedMember = await updateProjectMemberRole({
        id: memberId,
        projectRole: role,
      })

      dispatch(updateProjectMember(updatedMember))
      toast.add({
        type: "success",
        title: "Role updated",
        description: `Member role changed to ${formatRole(role)}.`,
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to update member role."
      setActionError(msg)
      toast.add({
        type: "error",
        title: "Failed to update role",
        description: msg,
      })
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * ------------------------------------------------------------
   * Remove member
   * ------------------------------------------------------------
   */

  async function handleConfirmRemoveMember() {
    if (!permissions.canManageMembers || !memberToDelete) return

    if (memberToDelete.user?.id === project?.owner?.id) {
      setActionError("The project owner cannot be removed.")
      setMemberToDelete(null)
      return
    }

    try {
      setActionLoading(true)
      setActionError(null)

      await deleteProjectMember({
        id: memberToDelete.id,
      })

      dispatch(removeProjectMember(memberToDelete.id))

      if (members.length === 1 && page > 0) {
        dispatch(setProjectMemberPage(page - 1))
      }

      const name = getUserName(memberToDelete)
      toast.add({
        type: "success",
        title: "Member removed",
        description: `${name || "Member"} was removed from the project.`,
      })
      setMemberToDelete(null)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to remove member."
      setActionError(msg)
      toast.add({
        type: "error",
        title: "Removal failed",
        description: msg,
      })
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * ------------------------------------------------------------
   * Add member
   * ------------------------------------------------------------
   */

  async function handleAddMember() {
    if (!projectId || !selectedUser || !permissions.canManageMembers) return

    try {
      setActionLoading(true)
      setActionError(null)

      const createdMember = await createProjectMember({
        projectId,
        projectMemberId: selectedUser.id,
        projectRole: selectedRole,
      })

      dispatch(addProjectMember(createdMember))

      const userName = getUserNameFromUser(selectedUser)
      toast.add({
        type: "success",
        title: "Member added",
        description: `${userName} has been added as a ${formatRole(selectedRole)}.`,
      })

      setSelectedUser(null)
      setSelectedRole("MEMBER")
      setMemberSearch("")
      setSearchResults([])
      setSearchError(null)
      setAddMemberOpen(false)

      /*
       * Refresh the current server page so pagination metadata and
       * ordering remain authoritative after the mutation.
       */
      const response = await getProjectMembers({
        projectId,
        page,
        size,
      })

      dispatch(setProjectMembers(response))
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to add project member."
      setActionError(msg)
      toast.add({
        type: "error",
        title: "Failed to add member",
        description: msg,
      })
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * ------------------------------------------------------------
   * Dialog helpers
   * ------------------------------------------------------------
   */

  function openAddMemberDialog() {
    setActionError(null)
    setMemberSearch("")
    setSearchResults([])
    setSearchError(null)
    setSelectedUser(null)
    setSelectedRole("MEMBER")
    setAddMemberOpen(true)
  }

  function closeAddMemberDialog() {
    if (actionLoading) return

    setAddMemberOpen(false)
    setMemberSearch("")
    setSearchResults([])
    setSearchError(null)
    setSelectedUser(null)
    setSelectedRole("MEMBER")
  }

  /*
   * ------------------------------------------------------------
   * Pagination
   * ------------------------------------------------------------
   */

  function handlePageChange(nextPage: number) {
    if (nextPage < 0 || nextPage >= totalPages) return

    dispatch(setProjectMemberPage(nextPage))
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button
          type="button"
          variant="ghost"
          className="mb-4 -ml-3 gap-2"
          onClick={() => navigate(`/app/projects/${projectId}`)}
        >
          <ArrowLeft className="size-4" />
          Project
        </Button>

        <PageHeader 
          title={project?.name ?? "Manage members"}
          description="Manage who has access to this project."
          className="mb-0"
          actions={
            permissions.canManageMembers && (
              <Button
                type="button"
                onClick={openAddMemberDialog}
                className="w-full sm:w-auto"
              >
                <Plus className="size-4" />
                Add member
              </Button>
            )
          }
        />
      </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertTitle>Action failed</AlertTitle>
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {project && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="size-10">
                  <AvatarFallback>
                    {`${project.owner?.firstName?.charAt(0) ?? ""}${project.owner?.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Project owner</p>

                  <p className="truncate text-sm font-medium">
                    {project.owner?.firstName} {project.owner?.lastName}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Members</p>

                  <p className="text-sm font-medium">{totalElements}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Your access</p>

                  <p className="text-sm font-medium">
                    {permissions.canChangeOwner
                      ? "Owner"
                      : permissions.canManageMembers
                        ? "Manager"
                        : "Member"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="overflow-visible">
          <CardHeader className="border-b bg-muted/20 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Members</CardTitle>
                <CardDescription>
                  People who currently have access to this project.
                </CardDescription>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search members..."
                    aria-label="Search members"
                    aria-keyshortcuts="/"
                    data-page-search=""
                    className="w-full pl-9 sm:w-64"
                  />
                </div>

                <Select
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as RoleFilter)}
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All roles</SelectItem>
                    <SelectItem value="MANAGER">Managers</SelectItem>
                    <SelectItem value="MEMBER">Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading members...
                </div>
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6">
                <Alert variant="destructive">
                  <AlertTitle>Unable to load members</AlertTitle>

                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Users className="size-5 text-muted-foreground" />
                </div>

                <p className="text-sm font-medium">No members found</p>

                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {search || roleFilter !== "ALL"
                    ? "Try changing your search or role filter."
                    : "This project does not have any members yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredMembers.map((member) => {
                  const isOwner = member.user?.id === project?.owner?.id

                  const memberName = getUserName(member)

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10 shrink-0">
                          <AvatarFallback>
                            {getUserInitials(member)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {memberName || "Unknown user"}
                            </p>

                            {isOwner && <Badge variant="outline">Owner</Badge>}
                          </div>

                          <p className="truncate text-xs text-muted-foreground">
                            {member.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <StatusBadge
                          status={member.projectRole}
                          label={formatRole(member.projectRole)}
                        />

                        {permissions.canManageMembers && !isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={actionLoading}
                                aria-label={`Manage ${memberName || "member"}`}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            } />

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(
                                    member.id,
                                    member.projectRole === "MEMBER"
                                      ? "MANAGER"
                                      : "MEMBER"
                                  )
                                }
                              >
                                <Shield className="size-4" />
                                {member.projectRole === "MEMBER"
                                  ? "Make manager"
                                  : "Make member"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setMemberToDelete(member)}
                              >
                                <Trash2 className="size-4" />
                                Remove member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {totalPages > 0 && (
              <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {totalElements === 0 ? 0 : page * size + 1}–{Math.min((page + 1) * size, totalElements)} of{" "}
                    {totalElements.toLocaleString("en-IN")} members
                  </p>
                  <PageSizeSelector
                    value={size}
                    onChange={(newSize) => {
                      dispatch(setProjectMemberPageSize(newSize))
                      dispatch(setProjectMemberPage(0))
                    }}
                    options={[10, 20, 50]}
                  />
                </div>

                {totalPages > 1 && (
                  <Pagination className="mx-0 w-auto justify-start sm:justify-end">
                    <PaginationContent className="flex-wrap">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          aria-disabled={page === 0}
                          tabIndex={page === 0 ? -1 : undefined}
                          className={
                            page === 0
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          onClick={(event) => {
                            event.preventDefault()
                            if (page > 0) {
                              handlePageChange(page - 1)
                            }
                          }}
                        />
                      </PaginationItem>

                      {getPaginationItems(totalPages, page).map((item, index) => (
                        <PaginationItem key={`${item}-${index}`}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={page === item}
                              aria-label={`Go to page ${item + 1}`}
                              aria-current={page === item ? "page" : undefined}
                              onClick={(event) => {
                                event.preventDefault()
                                if (page !== item) {
                                  handlePageChange(item)
                                }
                              }}
                            >
                              {item + 1}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          aria-disabled={page >= totalPages - 1}
                          tabIndex={page >= totalPages - 1 ? -1 : undefined}
                          className={
                            page >= totalPages - 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                          onClick={(event) => {
                            event.preventDefault()
                            if (page < totalPages - 1) {
                              handlePageChange(page + 1)
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      <Dialog
        open={addMemberOpen}
        onOpenChange={(open) => {
          if (open) {
            openAddMemberDialog()
          } else {
            closeAddMemberDialog()
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add project member</DialogTitle>

            <DialogDescription>
              Search for a user, choose their project role, and add them to this
              project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="member-search">
                Search user
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="member-search"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9"
                  autoComplete="off"
                />
              </div>
            </div>

            {searchError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Search failed</AlertTitle>
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            )}

            <div className="max-h-56 overflow-y-auto rounded-lg border">
              {searchLoading ? (
                <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Searching users...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y">
                  {searchResults.map((user) => {
                    const isSelected = selectedUser?.id === user.id

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setSelectedUser(user)}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <Avatar className="size-9 shrink-0">
                          <AvatarFallback>
                            {getUserInitialsFromUser(user)}
                          </AvatarFallback>
                        </Avatar>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {getUserNameFromUser(user)}
                          </span>

                          <span className="block truncate text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </span>

                        {isSelected && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex min-h-24 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  {memberSearch.trim()
                    ? "No available users found."
                    : "Start typing to search for a user."}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="member-role">
                Project role
              </label>

              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as ProjectRole)}
              >
                <SelectTrigger id="member-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>

                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="size-4 text-muted-foreground" />

                  <p className="min-w-0 text-sm">
                    Add{" "}
                    <span className="font-medium">
                      {getUserNameFromUser(selectedUser)}
                    </span>{" "}
                    as a {formatRole(selectedRole)}.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={closeAddMemberDialog}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={!selectedUser || actionLoading}
              onClick={handleAddMember}
            >
              {actionLoading && <Loader2 className="size-4 animate-spin" />}
              Add member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={Boolean(memberToDelete)}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setMemberToDelete(null)
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5 shrink-0" />
              <AlertDialogTitle>Remove Project Member</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-1.5 text-sm">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {memberToDelete ? getUserName(memberToDelete) : "this member"}
              </span>{" "}
              from the project? They will immediately lose access to all tasks and project resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-3 border-t">
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmRemoveMember}
              disabled={actionLoading}
              className="gap-2"
            >
              {actionLoading && <Loader2 className="size-4 animate-spin" />}
              {actionLoading ? "Removing..." : "Remove Member"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}

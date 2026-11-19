import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Building2,
  Users,
  UserPlus,
  Loader2,
  MoreVertical,
  Search,
  Shield,
  Trash2,
  AlertTriangle,
} from "lucide-react"

import { useAppSelector } from "@/hooks/redux-hooks"
import DataPagination, { useClientPagination } from "@/components/common/DataPagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useWorkspaceMembersQuery,
  useUpdateWorkspaceMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from "@/features/workspaces/hooks/useWorkspaces"
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceForm,
} from "@/features/workspaces/schemas/workspace.schema"
import { InviteMemberDialog } from "@/features/workspaces/components/InviteMemberDialog"
import { TransferOwnershipDialog } from "@/features/workspaces/components/TransferOwnershipDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import ShortcutHint from "@/components/common/ShortcutHint"
import { submitFormOnModEnter, toAriaKeyShortcuts } from "@/lib/keyboard"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { WorkspaceMember, WorkspaceRole } from "@/features/workspaces/types/workspace.types"

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return "?"
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

export default function OrganizationSettingsPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const activeWorkspace = useAppSelector((state) => state.workspaces.activeWorkspace)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("members")
  const [memberSearch, setMemberSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"ALL" | WorkspaceRole>("ALL")

  const isOrg = activeWorkspace?.workspaceType === "ORGANIZATION"
  const isOwner = activeWorkspace?.currentUserRole === "OWNER"
  const isAdmin = activeWorkspace?.currentUserRole === "ADMIN" || isOwner

  const workspaceId = activeWorkspace?.id

  // Data fetching
  const { data: members = [], isLoading: membersLoading } = useWorkspaceMembersQuery(
    isOrg ? workspaceId : undefined
  )
  const { mutate: updateWs, isPending: isUpdatingWs } = useUpdateWorkspaceMutation(
    workspaceId ?? ""
  )
  const { mutate: updateRole } = useUpdateMemberRoleMutation(workspaceId ?? "")
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMemberMutation(
    workspaceId ?? ""
  )

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    return members.filter((m) => {
      const fullName = `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim().toLowerCase()
      const email = (m.email ?? "").toLowerCase()
      const matchesSearch = !q || fullName.includes(q) || email.includes(q)
      const matchesRole = roleFilter === "ALL" || m.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, memberSearch, roleFilter])

  const {
    page: memberPage,
    setPage: setMemberPage,
    pageSize: memberPageSize,
    setPageSize: setMemberPageSize,
    totalElements: totalFilteredMembers,
    totalPages: totalMemberPages,
    paginatedItems: paginatedMembers,
  } = useClientPagination(filteredMembers, 10)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateWorkspaceForm>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: {
      name: activeWorkspace?.name ?? "",
    },
  })

  const onUpdateName = (data: UpdateWorkspaceForm) => {
    updateWs(data)
  }

  const handleRoleChange = (member: WorkspaceMember, newRole: WorkspaceRole) => {
    if (member.role === newRole) return
    updateRole({ userId: member.userId, data: { role: newRole } })
  }

  const handleRemoveMember = (member: WorkspaceMember) => {
    const isSelf = member.userId === currentUser?.id
    const confirmMsg = isSelf
      ? "Are you sure you want to leave this organization?"
      : `Are you sure you want to remove ${member.firstName ?? member.email} from this organization?`

    if (window.confirm(confirmMsg)) {
      removeMember(member.userId)
    }
  }

  if (!isOrg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
          <Building2 className="size-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Personal Workspace Active</h2>
        <p className="text-sm text-muted-foreground max-w-md mt-1.5 mb-6">
          You are currently in your Personal Workspace. To manage members and organization settings, please select an organization workspace or create a new one using the workspace switcher.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight break-words">{activeWorkspace.name}</h1>
            <Badge variant="outline" className="text-xs uppercase font-mono">
              {activeWorkspace.currentUserRole}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 break-words">
            Manage your organization profile, team members, and role permissions.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2 self-start sm:self-auto shrink-0">
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 min-w-0">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="size-4" />
            General Settings
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4 min-w-0">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader className="pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Organization Members</CardTitle>
                <CardDescription>
                  People who have access to collaborate on projects in this organization.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value)
                      setMemberPage(0)
                    }}
                    placeholder="Search members..."
                    aria-label="Search organization members"
                    aria-keyshortcuts="/"
                    data-page-search=""
                    className="h-8 pr-8 pl-8 text-xs sm:w-52"
                  />
                  {!memberSearch && (
                    <Kbd
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-2 hidden h-4 min-w-4 -translate-y-1/2 px-1 text-[9px] sm:inline-flex"
                    >
                      /
                    </Kbd>
                  )}
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    if (val) {
                      setRoleFilter(val as "ALL" | WorkspaceRole)
                      setMemberPage(0)
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-full sm:w-32 text-xs">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="OWNER">Owners</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                    <SelectItem value="MEMBER">Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined Date</TableHead>
                      {isAdmin && <TableHead className="w-[60px] text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {membersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="size-5 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : paginatedMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No members found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedMembers.map((member) => {
                        const isMemberOwner = member.role === "OWNER"
                        const isSelf = member.userId === currentUser?.id

                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8">
                                  <AvatarFallback className="text-xs font-semibold">
                                    {getInitials(member.firstName, member.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-sm truncate">
                                    {member.firstName ? `${member.firstName} ${member.lastName ?? ""}`.trim() : member.email}
                                    {isSelf && (
                                      <span className="ml-1.5 text-[11px] text-muted-foreground">(You)</span>
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={isMemberOwner ? "default" : "outline"}
                                className={`text-[10px] font-mono uppercase ${
                                  isMemberOwner
                                    ? "bg-primary text-primary-foreground"
                                    : member.role === "ADMIN"
                                    ? "border-primary/40 text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {member.role}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                                {member.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </TableCell>

                            {isAdmin && (
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={<Button variant="ghost" size="icon" className="size-8" />}
                                  >
                                    <MoreVertical className="size-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel className="text-xs">Member Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {/* Role changes available for owner */}
                                    {isOwner && !isMemberOwner && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleRoleChange(member, "ADMIN")}
                                          disabled={member.role === "ADMIN"}
                                        >
                                          <Shield className="mr-2 size-4" />
                                          Make Admin
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleRoleChange(member, "MEMBER")}
                                          disabled={member.role === "MEMBER"}
                                        >
                                          Make Member
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                      </>
                                    )}

                                    {/* Remove / Leave option */}
                                    {(!isMemberOwner || !isSelf) && (
                                      <DropdownMenuItem
                                        onClick={() => handleRemoveMember(member)}
                                        className="text-destructive focus:text-destructive"
                                        disabled={isRemoving}
                                      >
                                        <Trash2 className="mr-2 size-4" />
                                        {isSelf ? "Leave Organization" : "Remove Member"}
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {!membersLoading && totalFilteredMembers > 0 && (
                <DataPagination
                  className="px-4 py-3"
                  compact
                  page={memberPage}
                  totalPages={totalMemberPages}
                  totalElements={totalFilteredMembers}
                  pageSize={memberPageSize}
                  pageSizeOptions={[10, 20, 50]}
                  itemLabel="members"
                  onPageChange={setMemberPage}
                  onPageSizeChange={setMemberPageSize}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Plan &amp; Usage Quotas</CardTitle>
                <CardDescription>Current subscription tier and tenant resource limits.</CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono uppercase">
                {activeWorkspace.planTier ?? "FREE"} Plan
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Projects Used</p>
                <p className="text-lg font-semibold">
                  {activeWorkspace.projectCount}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {activeWorkspace.maxProjects && activeWorkspace.maxProjects > 0 ? activeWorkspace.maxProjects : "Unlimited"}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Members Used</p>
                <p className="text-lg font-semibold">
                  {activeWorkspace.memberCount}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {activeWorkspace.maxMembers && activeWorkspace.maxMembers > 0 ? activeWorkspace.maxMembers : "Unlimited"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Organization Profile</CardTitle>
              <CardDescription>Update your organization workspace name and details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onUpdateName)}
                onKeyDown={submitFormOnModEnter}
                aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
                className="space-y-4 max-w-md"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="org-name-input">Organization Name</Label>
                  <Input
                    id="org-name-input"
                    disabled={!isAdmin || isUpdatingWs}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {isAdmin && (
                  <Button type="submit" disabled={isUpdatingWs} className="gap-2">
                    {isUpdatingWs && <Loader2 className="mr-2 size-4 animate-spin" />}
                    <span>Save Changes</span>
                    <ShortcutHint
                      keys={["mod", "Enter"]}
                      compact
                      decorative
                      variant="onPrimary"
                      className="hidden sm:inline-flex ml-1"
                    />
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone: Transfer Ownership */}
          {isOwner && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5" />
                  <CardTitle className="text-base font-semibold">Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Transfer primary ownership of this organization to another active member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold">Transfer Organization Ownership</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You will step down to an Admin role. The new owner will have full control.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setTransferDialogOpen(true)}
                  >
                    Transfer Ownership
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InviteMemberDialog
        workspaceId={workspaceId!}
        workspaceName={activeWorkspace.name}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <TransferOwnershipDialog
        workspaceId={workspaceId!}
        workspaceName={activeWorkspace.name}
        members={members}
        currentUserId={currentUser?.id}
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
      />
    </div>
  )
}

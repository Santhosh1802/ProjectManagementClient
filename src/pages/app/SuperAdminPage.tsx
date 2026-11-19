import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
  Activity,
  Building2,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  Lock,
  Radio,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Workflow,
  Ban,
  RefreshCw,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataPagination from "@/components/common/DataPagination"
import { toast } from "@/components/ui/toast"
import { useAppSelector } from "@/hooks/redux-hooks"
import type { UserRole } from "@/features/users/types/user.types"
import {
  usePlatformOverviewQuery,
  useResetAccessPolicyMutation,
  useSuperAdminAccessPolicyQuery,
  useSuperAdminAuditLogsQuery,
  useSuperAdminUsersQuery,
  useSuperAdminWorkspacesQuery,
  useUpdateAccessPolicyMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useUpdateWorkspacePlanMutation,
  useUpdateWorkspaceStatusMutation,
  useVerifyUserEmailMutation,
} from "@/features/superadmin/hooks/useSuperAdminQuery"
import type {
  AccessControlPolicy,
  PlanTier,
  WorkspaceStatus,
  WorkspaceType,
} from "@/features/superadmin/types/superAdmin.types"

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  USER: "User",
}

const WORKSPACE_STATUS_LABELS: Record<WorkspaceStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
}

const WORKSPACE_TYPE_LABELS: Record<WorkspaceType, string> = {
  PERSONAL: "Personal",
  ORGANIZATION: "Organization",
}

const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
}

const DEFAULT_POLICY_FORM: AccessControlPolicy = {
  allowUserDirectorySearch: true,
  allowPersonalWorkspaceProjectMembers: true,
  autoEnrollProjectMembersIntoOrg: true,
  orgAdminCanManageAllProjects: true,
  orgMemberCanCreateProjects: true,
  orgMemberCanCreateChatGroups: true,
  projectManagerCanManageMembers: true,
  projectManagerCanEditProject: true,
  projectMemberCanCreateTasks: true,
  projectMemberCanAssignTasks: false,
  freeMaxProjects: 3,
  freeMaxMembers: 5,
  freeMaxWorkflowRules: 3,
  proMaxProjects: 25,
  proMaxMembers: 50,
  proMaxWorkflowRules: 25,
  enterpriseMaxProjects: -1,
  enterpriseMaxMembers: -1,
  enterpriseMaxWorkflowRules: -1,
  maxProjectStorageMb: 50,
}

function PolicyToggleRow({
  title,
  description,
  scopeBadge,
  checked,
  onToggle,
}: {
  title: string
  description: string
  scopeBadge: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          <Badge variant="outline" className="text-[10px]">
            {scopeBadge}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        type="button"
        role="switch"
        size="sm"
        variant={checked ? "default" : "outline"}
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className="h-7 shrink-0 rounded-full px-3 text-xs font-medium"
      >
        {checked ? "Allowed" : "Restricted"}
      </Button>
    </div>
  )
}

export default function SuperAdminPage() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  // Filters
  const [wsKeyword, setWsKeyword] = useState("")
  const [wsType, setWsType] = useState<WorkspaceType | "">("")
  const [wsStatus, setWsStatus] = useState<WorkspaceStatus | "">("")
  const [wsPage, setWsPage] = useState(0)
  const [wsPageSize, setWsPageSize] = useState(15)

  const [userKeyword, setUserKeyword] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | "">("")
  const [userPage, setUserPage] = useState(0)
  const [userPageSize, setUserPageSize] = useState(15)

  const [auditPage, setAuditPage] = useState(0)
  const [auditPageSize, setAuditPageSize] = useState(20)

  // Queries
  const overviewQuery = usePlatformOverviewQuery()
  const workspacesQuery = useSuperAdminWorkspacesQuery({
    keyword: wsKeyword,
    type: wsType,
    status: wsStatus,
    page: wsPage,
    size: wsPageSize,
  })
  const usersQuery = useSuperAdminUsersQuery({
    keyword: userKeyword,
    role: userRoleFilter,
    page: userPage,
    size: userPageSize,
  })
  const auditLogsQuery = useSuperAdminAuditLogsQuery(auditPage, auditPageSize)
  const accessPolicyQuery = useSuperAdminAccessPolicyQuery()

  // Mutations
  const updateWsStatus = useUpdateWorkspaceStatusMutation()
  const updateWsPlan = useUpdateWorkspacePlanMutation()
  const updateUserRole = useUpdateUserRoleMutation()
  const updateUserStatus = useUpdateUserStatusMutation()
  const verifyEmail = useVerifyUserEmailMutation()
  const updatePolicyMutation = useUpdateAccessPolicyMutation()
  const resetPolicyMutation = useResetAccessPolicyMutation()

  const [policyForm, setPolicyForm] = useState<AccessControlPolicy>(DEFAULT_POLICY_FORM)

  useEffect(() => {
    if (accessPolicyQuery.data) {
      setPolicyForm(accessPolicyQuery.data)
    }
  }, [accessPolicyQuery.data])

  function handleSavePolicy() {
    updatePolicyMutation.mutate(policyForm, {
      onSuccess: (saved) => {
        setPolicyForm(saved)
        toast.add({
          type: "success",
          title: "Access Control & Plans Saved",
          description:
            "Centralized permissions and workspace plan quotas are now active across the platform.",
        })
      },
      onError: () => {
        toast.add({
          type: "error",
          title: "Failed to save policy",
          description: "Unable to persist access control changes.",
        })
      },
    })
  }

  function handleResetPolicy() {
    resetPolicyMutation.mutate(undefined, {
      onSuccess: (resetData) => {
        setPolicyForm(resetData)
        toast.add({
          type: "success",
          title: "Defaults Restored",
          description: "Centralized permissions and plan quotas have been reset to defaults.",
        })
      },
    })
  }

  const overview = overviewQuery.data
  const kafka = overview?.kafkaStatus

  return (
    <div className="mx-auto flex min-w-0 w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 shrink-0 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight break-words">Super Admin Console</h1>
          </div>
          <p className="text-sm text-muted-foreground break-words">
            Centralized access control &amp; plan governance, tenant administration, user roles, Kafka telemetry, and global audit logs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto shrink-0"
          onClick={() => {
            void overviewQuery.refetch()
            void workspacesQuery.refetch()
            void usersQuery.refetch()
            void auditLogsQuery.refetch()
            void accessPolicyQuery.refetch()
          }}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh All
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setSearchParams({ tab: String(val) })
        }}
        className="w-full min-w-0 space-y-4"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="access-control">Access Control &amp; Plans</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="users">Users &amp; Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {overviewQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : overview ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      {overview.activeUsers} active · {overview.verifiedUsers} verified
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
                    <Building2 className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalWorkspaces}</div>
                    <p className="text-xs text-muted-foreground">
                      {overview.organizationWorkspaces} orgs · {overview.personalWorkspaces} personal · {overview.suspendedWorkspaces} suspended
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Projects &amp; Tasks</CardTitle>
                    <FolderKanban className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalProjects}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <ListChecks className="size-3" /> {overview.totalTasks} total tasks
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Workflow Runs</CardTitle>
                    <Workflow className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overview.totalWorkflowExecutions}</div>
                    <p className="text-xs text-muted-foreground">Automated rule executions</p>
                  </CardContent>
                </Card>
              </div>

              {kafka && (
                <Card>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Radio className="size-4 text-primary" />
                        Apache Kafka Event Pipeline
                      </CardTitle>
                      <CardDescription>
                        Durable domain event streaming &amp; dead-letter queue status
                      </CardDescription>
                    </div>
                    <Badge variant={kafka.enabled ? "default" : "secondary"}>
                      {kafka.enabled ? "Kafka Enabled" : "In-Process Fallback (Kafka Disabled)"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm min-w-0">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Bootstrap Servers</p>
                      <p className="font-mono font-medium break-all">{kafka.bootstrapServers}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Topics</p>
                      <p className="font-mono text-xs break-all">{kafka.domainEventsTopic}</p>
                      <p className="font-mono text-xs text-muted-foreground break-all">DLQ: {kafka.dlqTopic}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Published / Consumed</p>
                      <p className="font-semibold">
                        {kafka.publishedCount} / {kafka.consumedCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Failures</p>
                      <p className={kafka.failedCount > 0 ? "font-semibold text-destructive" : "font-semibold"}>
                        {kafka.failedCount}
                      </p>
                      {kafka.lastError && (
                        <p className="truncate text-xs text-destructive" title={kafka.lastError}>
                          {kafka.lastError}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </TabsContent>

        {/* CENTRALIZED ACCESS CONTROL & PLANS TAB */}
        <TabsContent value="access-control" className="space-y-6">
          {/* Header & Save Bar */}
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <SlidersHorizontal className="size-4 text-primary" />
                  Centralized Access Control &amp; Plan Governance
                </CardTitle>
                <CardDescription>
                  View and edit permissions across Global Roles, Organization Workspaces, and Project Scopes, plus customize plan tier quotas centrally.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={resetPolicyMutation.isPending || updatePolicyMutation.isPending}
                  onClick={handleResetPolicy}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Reset Defaults
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={updatePolicyMutation.isPending}
                  onClick={handleSavePolicy}
                >
                  <Save className="mr-1.5 size-3.5" />
                  Save Policy &amp; Quotas
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 1. Consolidated Multi-Scope Role Matrix */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Consolidated Role Hierarchy &amp; Scope Matrix
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scope</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>User Directory Search</TableHead>
                        <TableHead>Workspace / Org Admin</TableHead>
                        <TableHead>Project &amp; Member Mgmt</TableHead>
                        <TableHead>Task Execution</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      <TableRow>
                        <TableCell><Badge>Global</Badge></TableCell>
                        <TableCell className="font-semibold">SUPER_ADMIN</TableCell>
                        <TableCell className="text-emerald-600 font-medium">Full Access</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Tenants &amp; Plans</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Projects</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Tasks</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Badge variant="secondary">Global</Badge></TableCell>
                        <TableCell className="font-semibold">ADMIN</TableCell>
                        <TableCell className="text-emerald-600 font-medium">Full Access</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Workspaces</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Projects</TableCell>
                        <TableCell className="text-emerald-600 font-medium">All Tasks</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Badge variant="outline">Organization</Badge></TableCell>
                        <TableCell className="font-semibold">OWNER / ADMIN</TableCell>
                        <TableCell>
                          {policyForm.allowUserDirectorySearch ? "Allowed" : "Managers Only"}
                        </TableCell>
                        <TableCell className="text-emerald-600 font-medium">Invite &amp; Manage Org</TableCell>
                        <TableCell>
                          {policyForm.orgAdminCanManageAllProjects
                            ? "All Org Projects & Members"
                            : "Own Projects Only"}
                        </TableCell>
                        <TableCell>All Org Tasks</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Badge variant="outline">Organization</Badge></TableCell>
                        <TableCell className="font-semibold">MEMBER</TableCell>
                        <TableCell>
                          {policyForm.allowUserDirectorySearch ? "Allowed" : "Restricted"}
                        </TableCell>
                        <TableCell>View Org</TableCell>
                        <TableCell>
                          {policyForm.orgMemberCanCreateProjects
                            ? "Create & Own Projects"
                            : "Assigned Projects"}
                        </TableCell>
                        <TableCell>Assigned Project Tasks</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Badge variant="secondary">Project</Badge></TableCell>
                        <TableCell className="font-semibold">PROJECT OWNER / MANAGER</TableCell>
                        <TableCell>
                          {policyForm.allowUserDirectorySearch ? "Allowed (Add Members)" : "Restricted"}
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>
                          {policyForm.projectManagerCanManageMembers
                            ? "Add/Remove Members & Edit"
                            : "Project Owner Only"}
                        </TableCell>
                        <TableCell>Create, Assign &amp; Manage Tasks</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><Badge variant="secondary">Project</Badge></TableCell>
                        <TableCell className="font-semibold">PROJECT MEMBER</TableCell>
                        <TableCell>
                          {policyForm.allowUserDirectorySearch ? "Allowed (Chat/Collab)" : "Restricted"}
                        </TableCell>
                        <TableCell>—</TableCell>
                        <TableCell>View Project &amp; Members</TableCell>
                        <TableCell>
                          {policyForm.projectMemberCanCreateTasks ? "Create & Update Status" : "Update Status"}
                          {policyForm.projectMemberCanAssignTasks ? " + Assign" : ""}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* 2. Interactive Access Control Policy Toggles */}
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Lock className="size-4 text-primary" />
                  Interactive Permission Rules (Global, Organization &amp; Project)
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <PolicyToggleRow
                    title="Allow User Directory Search (/api/users/all)"
                    description="Allows authenticated Project Owners, Managers, and Workspace members to search users when adding project members or starting direct chats."
                    scopeBadge="Global & Project"
                    checked={policyForm.allowUserDirectorySearch}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        allowUserDirectorySearch: !prev.allowUserDirectorySearch,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Auto-Enroll Added Project Members into Organization"
                    description="When a user is added to a project inside an Organization Workspace, automatically enroll them as an ACTIVE Organization Member."
                    scopeBadge="Organization Workspace"
                    checked={policyForm.autoEnrollProjectMembersIntoOrg}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        autoEnrollProjectMembersIntoOrg: !prev.autoEnrollProjectMembersIntoOrg,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Allow Project Collaborators in Personal Workspaces"
                    description="Permits project owners to add team members to projects inside their Personal Workspace without requiring an Organization migration first."
                    scopeBadge="Personal Workspace"
                    checked={policyForm.allowPersonalWorkspaceProjectMembers}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        allowPersonalWorkspaceProjectMembers:
                          !prev.allowPersonalWorkspaceProjectMembers,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Organization Admins Manage All Org Projects"
                    description="Grants Organization Workspace OWNER and ADMIN full management permissions over all projects and project members in that organization."
                    scopeBadge="Organization Workspace"
                    checked={policyForm.orgAdminCanManageAllProjects}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        orgAdminCanManageAllProjects: !prev.orgAdminCanManageAllProjects,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Organization Members Can Create Projects"
                    description="Allows active Organization MEMBER accounts to create new projects within the Organization Workspace (subject to plan quotas)."
                    scopeBadge="Organization Workspace"
                    checked={policyForm.orgMemberCanCreateProjects}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        orgMemberCanCreateProjects: !prev.orgMemberCanCreateProjects,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Project Managers Can Add & Remove Project Members"
                    description="Allows users with ProjectRole.MANAGER to add, remove, and update member roles inside their assigned projects."
                    scopeBadge="Project Role"
                    checked={policyForm.projectManagerCanManageMembers}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        projectManagerCanManageMembers: !prev.projectManagerCanManageMembers,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Project Managers Can Edit Project Settings"
                    description="Allows ProjectRole.MANAGER to update project metadata, dates, status, and workflow automation rules."
                    scopeBadge="Project Role"
                    checked={policyForm.projectManagerCanEditProject}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        projectManagerCanEditProject: !prev.projectManagerCanEditProject,
                      }))
                    }
                  />

                  <PolicyToggleRow
                    title="Project Members Can Assign Tasks to Teammates"
                    description="When enabled, regular Project MEMBER accounts can assign tasks to others (otherwise restricted to Project Owner/Manager & Org Admin)."
                    scopeBadge="Project Role"
                    checked={policyForm.projectMemberCanAssignTasks}
                    onToggle={() =>
                      setPolicyForm((prev) => ({
                        ...prev,
                        projectMemberCanAssignTasks: !prev.projectMemberCanAssignTasks,
                      }))
                    }
                  />
                </div>
              </div>

              {/* 3. Centralized Workspace Plan Tier Quotas & Project Storage Limit */}
              <div className="space-y-3">
                <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">
                      Per-Project File &amp; Chat Storage Limit (MB)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Maximum total file &amp; image storage quota allowed per project (shared between project files and project chat attachments).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="quota-project-storage-mb"
                      type="number"
                      min={1}
                      value={policyForm.maxProjectStorageMb ?? 50}
                      onChange={(e) =>
                        setPolicyForm((p) => ({
                          ...p,
                          maxProjectStorageMb: Math.max(1, Number(e.target.value) || 50),
                        }))
                      }
                      className="h-8 w-24 text-xs font-mono"
                    />
                    <span className="text-xs font-medium text-muted-foreground">MB</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Workspace Plan Tier Quotas (FREE / PRO / ENTERPRISE)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Configure maximum projects, members, and workflow rules per workspace plan tier. Set to <code className="font-mono">-1</code> for unlimited.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* FREE PLAN */}
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">FREE Plan</span>
                      <Badge variant="outline">Starter</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-free-projects" className="text-xs">Max Projects</Label>
                      <Input
                        id="quota-free-projects"
                        type="number"
                        value={policyForm.freeMaxProjects}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            freeMaxProjects: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-free-members" className="text-xs">Max Workspace Members</Label>
                      <Input
                        id="quota-free-members"
                        type="number"
                        value={policyForm.freeMaxMembers}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            freeMaxMembers: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-free-rules" className="text-xs">Max Workflow Rules</Label>
                      <Input
                        id="quota-free-rules"
                        type="number"
                        value={policyForm.freeMaxWorkflowRules}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            freeMaxWorkflowRules: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* PRO PLAN */}
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">PRO Plan</span>
                      <Badge>Growth</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-pro-projects" className="text-xs">Max Projects</Label>
                      <Input
                        id="quota-pro-projects"
                        type="number"
                        value={policyForm.proMaxProjects}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            proMaxProjects: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-pro-members" className="text-xs">Max Workspace Members</Label>
                      <Input
                        id="quota-pro-members"
                        type="number"
                        value={policyForm.proMaxMembers}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            proMaxMembers: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-pro-rules" className="text-xs">Max Workflow Rules</Label>
                      <Input
                        id="quota-pro-rules"
                        type="number"
                        value={policyForm.proMaxWorkflowRules}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            proMaxWorkflowRules: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* ENTERPRISE PLAN */}
                  <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">ENTERPRISE Plan</span>
                      <Badge variant="secondary">Unlimited (-1)</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-ent-projects" className="text-xs">Max Projects (-1 = Unlimited)</Label>
                      <Input
                        id="quota-ent-projects"
                        type="number"
                        value={policyForm.enterpriseMaxProjects}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            enterpriseMaxProjects: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-ent-members" className="text-xs">Max Workspace Members (-1 = Unlimited)</Label>
                      <Input
                        id="quota-ent-members"
                        type="number"
                        value={policyForm.enterpriseMaxMembers}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            enterpriseMaxMembers: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="quota-ent-rules" className="text-xs">Max Workflow Rules (-1 = Unlimited)</Label>
                      <Input
                        id="quota-ent-rules"
                        type="number"
                        value={policyForm.enterpriseMaxWorkflowRules}
                        onChange={(e) =>
                          setPolicyForm((p) => ({
                            ...p,
                            enterpriseMaxWorkflowRules: Number(e.target.value),
                          }))
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WORKSPACES TAB */}
        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Workspaces</CardTitle>
              <CardDescription>
                Inspect all personal and organization workspaces, change plan tiers, and suspend or reactivate tenants.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workspace name or owner email..."
                    aria-label="Search workspaces"
                    aria-keyshortcuts="/"
                    data-page-search=""
                    className="pr-9 pl-8"
                    value={wsKeyword}
                    onChange={(e) => {
                      setWsKeyword(e.target.value)
                      setWsPage(0)
                    }}
                  />
                  {!wsKeyword && (
                    <Kbd
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 sm:inline-flex"
                    >
                      /
                    </Kbd>
                  )}
                </div>
                <Select
                  value={wsType || "ALL"}
                  onValueChange={(val) => {
                    setWsType(val === "ALL" ? "" : (val as WorkspaceType))
                    setWsPage(0)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="All Types">
                      {wsType ? WORKSPACE_TYPE_LABELS[wsType] : "All Types"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="ORGANIZATION">Organization</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={wsStatus || "ALL"}
                  onValueChange={(val) => {
                    setWsStatus(val === "ALL" ? "" : (val as WorkspaceStatus))
                    setWsPage(0)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="All Statuses">
                      {wsStatus ? WORKSPACE_STATUS_LABELS[wsStatus] : "All Statuses"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Projects</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspacesQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Loading workspaces...
                        </TableCell>
                      </TableRow>
                    ) : workspacesQuery.data?.content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No workspaces found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      workspacesQuery.data?.content.map((ws) => (
                        <TableRow key={ws.id}>
                          <TableCell className="font-medium">{ws.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{WORKSPACE_TYPE_LABELS[ws.workspaceType]}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={ws.planTier}
                              disabled={updateWsPlan.isPending}
                              onValueChange={(val) =>
                                updateWsPlan.mutate({
                                  workspaceId: ws.id,
                                  planTier: val as PlanTier,
                                })
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue>{PLAN_TIER_LABELS[ws.planTier]}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="FREE">Free</SelectItem>
                                <SelectItem value="PRO">Pro</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{ws.ownerName}</div>
                            <div className="text-xs text-muted-foreground">{ws.ownerEmail}</div>
                          </TableCell>
                          <TableCell>
                            {ws.memberCount}
                            {ws.maxMembers > 0 ? ` / ${ws.maxMembers}` : " / ∞"}
                          </TableCell>
                          <TableCell>
                            {ws.projectCount}
                            {ws.maxProjects > 0 ? ` / ${ws.maxProjects}` : " / ∞"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ws.status === "ACTIVE"
                                  ? "default"
                                  : ws.status === "SUSPENDED"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {WORKSPACE_STATUS_LABELS[ws.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {ws.status === "ACTIVE" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updateWsStatus.isPending}
                                onClick={() =>
                                  updateWsStatus.mutate({
                                    workspaceId: ws.id,
                                    status: "SUSPENDED",
                                  })
                                }
                              >
                                <Ban className="mr-1.5 size-3.5" />
                                Suspend
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updateWsStatus.isPending}
                                onClick={() =>
                                  updateWsStatus.mutate({
                                    workspaceId: ws.id,
                                    status: "ACTIVE",
                                  })
                                }
                              >
                                <CheckCircle2 className="mr-1.5 size-3.5" />
                                Activate
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {workspacesQuery.data && workspacesQuery.data.totalElements > 0 && (
                <DataPagination
                  page={workspacesQuery.data.page}
                  totalPages={workspacesQuery.data.totalPages}
                  totalElements={workspacesQuery.data.totalElements}
                  pageSize={wsPageSize}
                  pageSizeOptions={[10, 15, 25, 50]}
                  itemLabel="workspaces"
                  onPageChange={setWsPage}
                  onPageSizeChange={(nextSize) => {
                    setWsPageSize(nextSize)
                    setWsPage(0)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Users &amp; Roles</CardTitle>
              <CardDescription>
                Manage global user roles, account activation, and email verification across all workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search user name or email..."
                    aria-label="Search platform users"
                    aria-keyshortcuts="/"
                    data-page-search=""
                    className="pr-9 pl-8"
                    value={userKeyword}
                    onChange={(e) => {
                      setUserKeyword(e.target.value)
                      setUserPage(0)
                    }}
                  />
                  {!userKeyword && (
                    <Kbd
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 sm:inline-flex"
                    >
                      /
                    </Kbd>
                  )}
                </div>
                <Select
                  value={userRoleFilter || "ALL"}
                  onValueChange={(val) => {
                    setUserRoleFilter(val === "ALL" ? "" : (val as UserRole))
                    setUserPage(0)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Roles">
                      {userRoleFilter ? ROLE_LABELS[userRoleFilter] : "All Roles"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Global Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : usersQuery.data?.content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersQuery.data?.content.map((u) => {
                        const isSelf = currentUser?.email?.toLowerCase() === u.email.toLowerCase()
                        return (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="font-medium">
                                {u.firstName} {u.lastName ?? ""}
                                {isSelf && (
                                  <Badge variant="secondary" className="ml-2 text-[10px]">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.userRole}
                                disabled={isSelf || updateUserRole.isPending}
                                onValueChange={(val) =>
                                  updateUserRole.mutate({
                                    userId: u.id,
                                    role: val as UserRole,
                                  })
                                }
                              >
                                <SelectTrigger className="w-36 h-8">
                                  <SelectValue>{ROLE_LABELS[u.userRole]}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                  <SelectItem value="ADMIN">Admin</SelectItem>
                                  <SelectItem value="MANAGER">Manager</SelectItem>
                                  <SelectItem value="USER">User</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.isActive ? "default" : "destructive"}>
                                {u.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.emailVerified ? (
                                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                                  Verified
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={verifyEmail.isPending}
                                  onClick={() => verifyEmail.mutate(u.id)}
                                >
                                  Verify Email
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant={u.isActive ? "outline" : "default"}
                                disabled={isSelf || updateUserStatus.isPending}
                                onClick={() =>
                                  updateUserStatus.mutate({
                                    userId: u.id,
                                    isActive: !u.isActive,
                                  })
                                }
                              >
                                {u.isActive ? (
                                  <>
                                    <ShieldAlert className="mr-1.5 size-3.5" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-1.5 size-3.5" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {usersQuery.data && usersQuery.data.totalElements > 0 && (
                <DataPagination
                  page={usersQuery.data.page}
                  totalPages={usersQuery.data.totalPages}
                  totalElements={usersQuery.data.totalElements}
                  pageSize={userPageSize}
                  pageSizeOptions={[10, 15, 25, 50]}
                  itemLabel="users"
                  onPageChange={setUserPage}
                  onPageSizeChange={(nextSize) => {
                    setUserPageSize(nextSize)
                    setUserPage(0)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOGS TAB */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Platform Audit Logs
              </CardTitle>
              <CardDescription>
                Cross-tenant chronological activity log across all projects and tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogsQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Loading audit logs...
                        </TableCell>
                      </TableRow>
                    ) : auditLogsQuery.data?.content.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No audit logs recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditLogsQuery.data?.content.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{log.actorName}</div>
                            <div className="text-xs text-muted-foreground">{log.actorEmail}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.actionType}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm" title={log.details}>
                            {log.details}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {auditLogsQuery.data && auditLogsQuery.data.totalElements > 0 && (
                <DataPagination
                  page={auditLogsQuery.data.page}
                  totalPages={auditLogsQuery.data.totalPages}
                  totalElements={auditLogsQuery.data.totalElements}
                  pageSize={auditPageSize}
                  pageSizeOptions={[10, 20, 50, 100]}
                  itemLabel="audit logs"
                  onPageChange={setAuditPage}
                  onPageSizeChange={(nextSize) => {
                    setAuditPageSize(nextSize)
                    setAuditPage(0)
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

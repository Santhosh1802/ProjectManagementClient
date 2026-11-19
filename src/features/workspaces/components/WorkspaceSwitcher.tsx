import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Building2,
  Check,
  ChevronDown,
  Plus,
  Settings,
  User,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useAppSelector } from "@/hooks/redux-hooks"
import { useWorkspacesQuery, useSwitchWorkspace } from "../hooks/useWorkspaces"
import {
  readDefaultWorkspacePreference,
  resolveDefaultWorkspace,
} from "../slice/workspaceSlice"
import { CreateOrganizationDialog } from "./CreateOrganizationDialog"
import type { Workspace } from "../types/workspace.types"

export function WorkspaceSwitcher() {
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Fetch workspaces list & sync
  const { data: workspaces = [], isLoading } = useWorkspacesQuery()
  const activeWorkspace = useAppSelector((state) => state.workspaces?.activeWorkspace ?? null)
  const storedDefaultPref = useAppSelector(
    (state) => state.workspaces?.defaultWorkspacePreference
  )
  const currentUserId = useAppSelector((state) => state.auth?.user?.id ?? null)
  const switchWorkspace = useSwitchWorkspace()

  const effectivePref =
    storedDefaultPref ?? readDefaultWorkspacePreference(currentUserId)
  const resolvedDefaultWorkspace =
    effectivePref && effectivePref !== "AUTO_PERSONAL"
      ? resolveDefaultWorkspace(workspaces, effectivePref)
      : null

  const personalWorkspaces = workspaces.filter((w) => w.workspaceType === "PERSONAL")
  const organizationWorkspaces = workspaces.filter((w) => w.workspaceType === "ORGANIZATION")

  const handleSelectWorkspace = (workspace: Workspace) => {
    if (activeWorkspace?.id === workspace.id) return
    switchWorkspace(workspace)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleOpenSettings = () => {
    navigate("/app/organization/settings")
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleOpenDefaultWorkspaceSettings = () => {
    navigate("/app/settings?tab=workspace")
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <SidebarMenuButton
                size="lg"
                className="group relative overflow-hidden rounded-xl p-2 transition-all duration-200 hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
              />
            }>
              <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover:scale-105 group-hover:bg-primary/20 shadow-xs">
                {activeWorkspace?.workspaceType === "ORGANIZATION" ? (
                  <Building2 className="size-4" />
                ) : (
                  <User className="size-4" />
                )}
              </div>

              <div className="flex flex-1 flex-col items-start text-left text-sm leading-tight group-data-[collapsible=icon]:hidden min-w-0">
                <span className="truncate font-semibold tracking-tight text-sidebar-foreground w-full">
                  {isLoading && !activeWorkspace ? "Loading workspace..." : (activeWorkspace?.name ?? "Select Workspace")}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {activeWorkspace?.workspaceType === "ORGANIZATION" ? "Organization" : "Personal"}
                  </span>
                  {activeWorkspace?.currentUserRole && activeWorkspace.workspaceType === "ORGANIZATION" && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-3.5 border-primary/20 bg-primary/5 text-primary font-mono uppercase"
                    >
                      {activeWorkspace.currentUserRole}
                    </Badge>
                  )}
                </div>
              </div>

              <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 rounded-xl shadow-lg border border-border/80"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              {personalWorkspaces.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5">
                    Personal Workspace
                  </DropdownMenuLabel>
                  {personalWorkspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className="flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <User className="size-3.5" />
                        </div>
                        <span className="truncate text-xs font-medium">{ws.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {resolvedDefaultWorkspace?.id === ws.id && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 h-3.5 uppercase font-mono"
                          >
                            Default
                          </Badge>
                        )}
                        {activeWorkspace?.id === ws.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )}

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuGroup>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-0">
                    Organizations
                  </DropdownMenuLabel>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    {organizationWorkspaces.length}
                  </Badge>
                </div>

                {organizationWorkspaces.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground italic">
                    No organizations yet
                  </div>
                ) : (
                  organizationWorkspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws)}
                      className="flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Building2 className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-xs font-medium">{ws.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {ws.memberCount} {ws.memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {resolvedDefaultWorkspace?.id === ws.id && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 h-3.5 uppercase font-mono"
                          >
                            Default
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-3.5 border-border text-muted-foreground uppercase font-mono"
                        >
                          {ws.currentUserRole}
                        </Badge>
                        {activeWorkspace?.id === ws.id && (
                          <Check className="size-4 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer py-2 px-2.5 rounded-lg text-primary hover:text-primary font-medium text-xs"
                >
                  <Plus className="size-4" />
                  <span>Create Organization</span>
                </DropdownMenuItem>

                {activeWorkspace?.workspaceType === "ORGANIZATION" && (
                  <DropdownMenuItem
                    onClick={handleOpenSettings}
                    className="flex items-center gap-2 cursor-pointer py-2 px-2.5 rounded-lg text-muted-foreground hover:text-foreground text-xs"
                  >
                    <Settings className="size-4" />
                    <span>Organization Settings</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleOpenDefaultWorkspaceSettings}
                  className="flex items-center gap-2 cursor-pointer py-2 px-2.5 rounded-lg text-muted-foreground hover:text-foreground text-xs"
                >
                  <Settings className="size-4" />
                  <span>Default Workspace Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateOrganizationDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  )
}

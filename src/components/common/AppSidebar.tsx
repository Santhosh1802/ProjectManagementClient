import { useState } from "react"
import {
  Activity,
  Bell,
  Building2,
  Check,
  CheckSquare,
  ChevronRight,
  ChevronUp,
  FolderKanban,
  FolderPlus,
  Hash,
  Keyboard,
  Laptop,
  LayoutDashboard,
  ListPlus,
  ListTodo,
  LogOut,
  MessageCircle,
  Moon,
  Palette,
  PenTool,
  Plus,
  Settings,
  SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  UserCircle,
  UserPlus,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { cn } from "cn"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import ShortcutHint from "@/components/common/ShortcutHint"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import {
  setTheme,
  setPrimaryColor,
  setSecondaryColor,
  type Theme,
} from "../../app/slice/themeSlice"
import {
  THEME_COLORS,
  THEME_COLOR_LIST,
  type ThemeColorKey,
} from "@/config/themeColors"
import { logout } from "@/features/auth/slice/authSlice"
import { clearUser } from "@/features/users/slice/user.slice"
import { LogoutUser } from "@/features/auth/services/auth.service"
import { clearProjects } from "@/features/projects/slice/projectSlice"

import type { LucideIcon } from "lucide-react"

import { getShortcut } from "@/config/keyboardShortcuts"
import { useKeyboardShortcutsUI } from "@/context/KeyboardShortcutsContext"
import { toAriaKeyShortcuts } from "@/lib/keyboard"
import { clearTasks } from "@/features/tasks/slice/task.slice"
import { clearProjectMembers } from "@/features/projects/slice/projectMemberSlice"
import { clearWorkspaces } from "@/features/workspaces/slice/workspaceSlice"
import { WorkspaceSwitcher } from "@/features/workspaces/components/WorkspaceSwitcher"
import { useUnreadNotificationsCountQuery } from "@/features/notifications/hooks/useNotificationsQuery"
import { queryClient } from "@/lib/queryClient"
import type { AppRole } from "@/config/routeAccess"

const shortcutsHelpKeys = getShortcut("global.shortcuts")?.keys ?? ["mod", "/"]

interface SubNavigationItem {
  title: string
  url: string
  icon?: LucideIcon
  shortcut?: string[]
  exact?: boolean
}

interface NavigationItem {
  id: string
  title: string
  url: string
  icon: LucideIcon
  shortcut?: string[]
  badgeCount?: number
  quickActionUrl?: string
  quickActionTitle?: string
  subItems?: SubNavigationItem[]
}

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) {
    return "?"
  }
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

export default function AppSidebar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const activeWorkspace = useAppSelector(
    (state) => state.workspaces?.activeWorkspace
  )
  const { openShortcuts } = useKeyboardShortcutsUI()
  const { pathname, search } = useLocation()
  const currentFullUrl = `${pathname}${search}`

  const userRole = user?.user_role?.toUpperCase() as AppRole | undefined

  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery()

  // Track which collapsible sidebar sections are expanded
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    projects: true,
    tasks: true,
    chat: false,
    "super-admin": true,
    users: false,
    account: false,
  })

  function toggleMenu(id: string) {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const theme = useAppSelector((state) => state.theme.theme)
  const primaryColor = useAppSelector(
    (state) => state.theme.primaryColor || "indigo"
  )
  const secondaryColor = useAppSelector(
    (state) => state.theme.secondaryColor || "teal"
  )

  const initials = getInitials(user?.firstName, user?.lastName)
  const fullName = user ? `${user.firstName} ${user.lastName}` : "User"

  const handleThemeChange = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme))
  }

  const handlePrimaryChange = (selectedColor: ThemeColorKey) => {
    dispatch(setPrimaryColor(selectedColor))
  }

  const handleSecondaryChange = (selectedColor: ThemeColorKey) => {
    dispatch(setSecondaryColor(selectedColor))
  }

  const handleLogout = async () => {
    try {
      await LogoutUser()
    } catch (error) {
      console.log(error)
    } finally {
      queryClient.cancelQueries()
      queryClient.clear()
      dispatch(logout())
      dispatch(clearUser())
      dispatch(clearProjects())
      dispatch(clearTasks())
      dispatch(clearProjectMembers())
      dispatch(clearWorkspaces())
      navigate("/login", { replace: true })
    }
  }

  const { isMobile, setOpenMobile } = useSidebar()

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const isRouteActive = (url: string) => {
    if (url.includes("?")) {
      return currentFullUrl === url
    }
    if (url === "/app/dashboard") {
      return pathname === "/app/dashboard"
    }
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const isSubItemActive = (sub: SubNavigationItem) => {
    if (sub.url.includes("?")) {
      return currentFullUrl === sub.url
    }
    if (sub.exact) {
      return pathname === sub.url && !search
    }
    return pathname === sub.url || pathname.startsWith(`${sub.url}/`)
  }

  const projectSubItems: SubNavigationItem[] = [
    {
      title: "All Projects",
      url: "/app/projects",
      icon: FolderKanban,
      shortcut: ["G", "P"],
      exact: true,
    },
    {
      title: "Create Project",
      url: "/app/projects/create",
      icon: FolderPlus,
      shortcut: ["C", "P"],
      exact: true,
    },
  ]

  const coreWorkspaceItems: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/app/dashboard",
      icon: LayoutDashboard,
      shortcut: ["G", "D"],
    },
    {
      id: "projects",
      title: "Projects",
      url: "/app/projects",
      icon: FolderKanban,
      shortcut: ["G", "P"],
      quickActionUrl: "/app/projects/create",
      quickActionTitle: "New Project",
      subItems: projectSubItems,
    },
    {
      id: "tasks",
      title: "Tasks",
      url: "/app/tasks",
      icon: CheckSquare,
      shortcut: ["G", "T"],
      quickActionUrl: "/app/tasks/create",
      quickActionTitle: "New Task",
      subItems: [
        {
          title: "All Tasks",
          url: "/app/tasks",
          icon: ListTodo,
          shortcut: ["G", "T"],
          exact: true,
        },
        {
          title: "Create Task",
          url: "/app/tasks/create",
          icon: ListPlus,
          shortcut: ["C", "T"],
          exact: true,
        },
      ],
    },
    {
      id: "chat",
      title: "Team Chat",
      url: "/app/chat",
      icon: MessageCircle,
      subItems: [
        {
          title: "All Conversations",
          url: "/app/chat?scope=all",
          icon: MessageCircle,
          shortcut: ["G", "C"],
        },
        {
          title: "Direct Messages",
          url: "/app/chat?scope=direct",
          icon: Users,
        },
        {
          title: "Workspace Channels",
          url: "/app/chat?scope=workspace",
          icon: Hash,
        },
        {
          title: "Project Channels",
          url: "/app/chat?scope=project",
          icon: FolderKanban,
        },
      ],
    },
    {
      id: "whiteboards",
      title: "Whiteboards",
      url: "/app/whiteboards",
      icon: PenTool,
      shortcut: ["G", "W"],
    },
    {
      id: "notifications",
      title: "Notifications",
      url: "/app/notifications",
      icon: Bell,
      shortcut: ["G", "N"],
      badgeCount: unreadCount > 0 ? unreadCount : undefined,
    },
  ]

  const governanceItems: NavigationItem[] = []

  if (activeWorkspace?.workspaceType === "ORGANIZATION") {
    governanceItems.push({
      id: "org-settings",
      title: "Organization",
      url: "/app/organization/settings",
      icon: Building2,
      shortcut: ["G", "O"],
    })
  }

  if (userRole === "SUPER_ADMIN") {
    governanceItems.push({
      id: "super-admin",
      title: "Super Admin",
      url: "/app/super-admin",
      icon: ShieldCheck,
      subItems: [
        {
          title: "Platform Overview",
          url: "/app/super-admin?tab=overview",
          icon: LayoutDashboard,
          shortcut: ["G", "A"],
        },
        {
          title: "Access Control & Plans",
          url: "/app/super-admin?tab=access-control",
          icon: SlidersHorizontal,
        },
        {
          title: "Tenant Workspaces",
          url: "/app/super-admin?tab=workspaces",
          icon: Building2,
        },
        {
          title: "Users & Global Roles",
          url: "/app/super-admin?tab=users",
          icon: Users,
        },
        {
          title: "Audit Logs",
          url: "/app/super-admin?tab=audit",
          icon: Activity,
        },
      ],
    })
  }

  if (
    userRole === "SUPER_ADMIN" ||
    userRole === "ADMIN" ||
    userRole === "MANAGER"
  ) {
    governanceItems.push({
      id: "users",
      title: "Users & Directory",
      url: userRole === "MANAGER" ? "/app/users/create" : "/app/users",
      icon: Users,
      shortcut: ["G", "U"],
      subItems:
        userRole === "MANAGER"
          ? [
              {
                title: "Create User",
                url: "/app/users/create",
                icon: UserPlus,
                shortcut: ["C", "U"],
                exact: true,
              },
            ]
          : [
              {
                title: "User Directory",
                url: "/app/users",
                icon: Users,
                shortcut: ["G", "U"],
                exact: true,
              },
              {
                title: "Create User",
                url: "/app/users/create",
                icon: UserPlus,
                shortcut: ["C", "U"],
                exact: true,
              },
            ],
    })
  }

  const accountItems: NavigationItem[] = [
    {
      id: "account",
      title: "Account & Security",
      url: "/app/profile",
      icon: UserCircle,
      subItems: [
        {
          title: "Profile & MFA",
          url: "/app/profile",
          icon: UserCircle,
          shortcut: ["G", "M"],
          exact: true,
        },
        {
          title: "Preferences",
          url: "/app/settings",
          icon: SettingsIcon,
          shortcut: ["G", "S"],
          exact: true,
        },
      ],
    },
  ]

  function renderNavSection(items: NavigationItem[]) {
    return (
      <SidebarMenu className="gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const hasSub = Boolean(item.subItems && item.subItems.length > 0)
          const active = isRouteActive(item.url)
          const isExpanded = Boolean(openMenus[item.id]) || active

          return (
            <SidebarMenuItem key={item.id} className="flex-col items-stretch">
              <div className="relative flex w-full items-center">
                <SidebarMenuButton
                  render={
                    <NavLink
                      to={item.url}
                      end={item.url === "/app/dashboard"}
                      onClick={() => {
                        if (hasSub && !openMenus[item.id]) {
                          setOpenMenus((prev) => ({ ...prev, [item.id]: true }))
                        }
                        handleNavClick()
                      }}
                    />
                  }
                  tooltip={item.title}
                  isActive={active && !hasSub}
                  className={cn(
                    "group/nav relative flex items-center rounded-lg px-2.5 py-2 font-medium transition-all duration-200",
                    active
                      ? hasSub
                        ? "bg-primary/12 text-primary font-semibold hover:bg-primary/18"
                        : "!bg-primary !text-primary-foreground font-semibold shadow-sm shadow-primary/25 hover:!bg-primary/95 hover:!text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 group-hover/nav:scale-110",
                      active
                        ? hasSub
                          ? "text-primary"
                          : "!text-primary-foreground"
                        : "text-muted-foreground group-hover/nav:text-primary"
                    )}
                  />
                  <span className="truncate">{item.title}</span>

                  {!hasSub && item.shortcut && (
                    <ShortcutHint
                      keys={item.shortcut}
                      sequence
                      compact
                      decorative
                      variant={active ? "onPrimary" : "default"}
                      className={cn(
                        "ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline-flex",
                        item.badgeCount ? "mr-6" : ""
                      )}
                    />
                  )}

                  {active && !hasSub && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-foreground/90 transition-all group-data-[collapsible=icon]:hidden" />
                  )}
                </SidebarMenuButton>

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <SidebarMenuBadge className="bg-primary text-primary-foreground text-[10px] font-semibold">
                    {item.badgeCount}
                  </SidebarMenuBadge>
                )}

                {hasSub && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 group-data-[collapsible=icon]:hidden">
                    {item.quickActionUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(item.quickActionUrl!)
                          handleNavClick()
                        }}
                        title={item.quickActionTitle ?? "Create new"}
                        aria-label={item.quickActionTitle ?? "Create new"}
                        className="flex size-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-sidebar-accent hover:text-foreground group-hover/menu-item:opacity-100"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleMenu(item.id)
                      }}
                      aria-label={`Toggle ${item.title} submenu`}
                      aria-expanded={isExpanded}
                      className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    >
                      <ChevronRight
                        className={cn(
                          "size-3.5 transition-transform duration-200",
                          isExpanded && "rotate-90 text-primary"
                        )}
                      />
                    </button>
                  </div>
                )}
              </div>

              {hasSub && isExpanded && (
                <SidebarMenuSub className="mt-1 mb-1 space-y-0.5 border-s-2 border-primary/20 pl-2.5">
                  {item.subItems!.map((sub) => {
                    const SubIcon = sub.icon
                    const subActive = isSubItemActive(sub)
                    return (
                      <SidebarMenuSubItem key={sub.url}>
                        <SidebarMenuSubButton
                          render={
                            <NavLink
                              to={sub.url}
                              end={sub.exact}
                              onClick={handleNavClick}
                            />
                          }
                          isActive={subActive}
                          className={cn(
                            "rounded-md px-2 py-1.5 text-xs transition-colors",
                            subActive
                              ? "bg-primary/15 font-semibold text-primary data-active:bg-primary/15 data-active:text-primary"
                              : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                          )}
                        >
                          {SubIcon && (
                            <SubIcon
                              className={cn(
                                "size-3.5 shrink-0",
                                subActive ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                          <span className="truncate">{sub.title}</span>
                          {sub.shortcut && (
                            <ShortcutHint
                              keys={sub.shortcut}
                              sequence
                              compact
                              decorative
                              className="ml-auto hidden lg:inline-flex"
                            />
                          )}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )
                  })}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    )
  }

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-sidebar-border/80 bg-sidebar transition-colors duration-300"
    >
      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}
      <SidebarHeader className="border-b border-sidebar-border/60 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<NavLink to="/app/dashboard" onClick={handleNavClick} />}
                size="lg"
                tooltip="DevFlow"
                className="group/logo relative overflow-hidden rounded-xl p-2 transition-all duration-300 hover:bg-sidebar-accent/80 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
              >
                <div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:bg-primary/20 shadow-xs">
                  <img
                    src="/logo.png"
                    alt="DevFlow"
                    width="22"
                    height="22"
                    className="object-contain drop-shadow-xs transition-transform duration-300 group-hover/logo:rotate-3"
                  />
                </div>

                <div className="flex flex-1 items-center gap-2 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold tracking-tight text-sidebar-foreground flex items-center gap-1.5">
                      DevFlow
                      <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      SaaS Platform
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className="ml-auto font-mono text-[9px] font-semibold border-primary/20 bg-primary/5 text-primary px-1.5 py-0"
                  >
                    v{import.meta.env.VITE_APP_VERSION}
                  </Badge>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="size-8 shrink-0 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:hidden"
              aria-label="Close sidebar"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />
      </SidebarHeader>

      {/* ----------------------------------------- */}
      {/* Main Navigation with Collapsible Sub-Menus */}
      {/* ----------------------------------------- */}
      <SidebarContent className="gap-1.5 py-2.5 px-1">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderNavSection(coreWorkspaceItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {governanceItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {renderNavSection(governanceItems)}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderNavSection(accountItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ----------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------- */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu className="gap-1">
          {/* Theme */}
          <SidebarMenuItem className="px-1 py-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Appearance"
                    className="rounded-lg bg-muted/40 hover:bg-sidebar-accent border border-sidebar-border/50 transition-all duration-200 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
                  />
                }
              >
                <div className="flex size-4 items-center justify-center text-primary">
                  {theme === "light" && <Sun className="size-4" />}
                  {theme === "dark" && <Moon className="size-4" />}
                  {theme === "system" && <Laptop className="size-4" />}
                </div>

                <span className="font-medium group-data-[collapsible=icon]:hidden">
                  Appearance
                </span>

                <span className="ml-auto flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground border border-border/40 group-data-[collapsible=icon]:hidden">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      THEME_COLORS[primaryColor]?.swatchClass
                    )}
                  />
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      THEME_COLORS[secondaryColor]?.swatchClass
                    )}
                  />
                  {theme}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex items-center justify-between px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Mode</span>
                  <ShortcutHint keys={["d"]} compact decorative />
                </div>
                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                  <Sun className="size-4" />
                  <span>Light</span>
                  {theme === "light" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                  <Moon className="size-4" />
                  <span>Dark</span>
                  {theme === "dark" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                  <Laptop className="size-4" />
                  <span>System</span>
                  {theme === "system" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <div className="px-1.5 py-1.5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Palette className="size-3.5 text-primary" />
                    <span>Dual Theme Colors</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Primary</span>
                      <span className="font-medium">
                        {THEME_COLORS[primaryColor]?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {THEME_COLOR_LIST.map((c) => (
                        <button
                          key={`sb-p-${c.key}`}
                          type="button"
                          title={`Primary: ${c.label}`}
                          aria-label={`Primary color ${c.label}`}
                          onClick={() => handlePrimaryChange(c.key)}
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full transition-transform hover:scale-110",
                            c.swatchClass,
                            primaryColor === c.key &&
                              "ring-2 ring-foreground ring-offset-1 ring-offset-popover"
                          )}
                        >
                          {primaryColor === c.key && (
                            <Check className="size-2.5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Secondary</span>
                      <span className="font-medium">
                        {THEME_COLORS[secondaryColor]?.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {THEME_COLOR_LIST.map((c) => (
                        <button
                          key={`sb-s-${c.key}`}
                          type="button"
                          title={`Secondary: ${c.label}`}
                          aria-label={`Secondary color ${c.label}`}
                          onClick={() => handleSecondaryChange(c.key)}
                          className={cn(
                            "flex size-5 items-center justify-center rounded-full transition-transform hover:scale-110",
                            c.swatchClass,
                            secondaryColor === c.key &&
                              "ring-2 ring-foreground ring-offset-1 ring-offset-popover"
                          )}
                        >
                          {secondaryColor === c.key && (
                            <Check className="size-2.5 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* User */}
          <SidebarMenuItem className="px-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={fullName}
                    className="bg-muted group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
                  />
                }
              >
                <Avatar className="size-8 shrink-0">
                  {user?.avatarUrl && (
                    <AvatarImage src={user.avatarUrl} alt={fullName} />
                  )}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{fullName}</span>

                  <span className="truncate text-xs text-muted-foreground">
                    {userRole ?? "USER"}
                  </span>
                </div>

                <ChevronUp className="size-4 group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">
                  My Account
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  render={
                    <NavLink to="/app/profile" onClick={handleNavClick} />
                  }
                >
                  <UserCircle className="size-4" />
                  <span>Profile</span>
                  <ShortcutHint
                    keys={["g", "m"]}
                    sequence
                    compact
                    decorative
                    className="ml-auto"
                  />
                </DropdownMenuItem>

                <DropdownMenuItem
                  render={
                    <NavLink to="/app/settings" onClick={handleNavClick} />
                  }
                >
                  <Settings className="size-4" />
                  <span>Settings</span>
                  <ShortcutHint
                    keys={["g", "s"]}
                    sequence
                    compact
                    decorative
                    className="ml-auto"
                  />
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={openShortcuts}
                  aria-keyshortcuts={toAriaKeyShortcuts(shortcutsHelpKeys)}
                >
                  <Keyboard className="size-4" />
                  <span>Keyboard shortcuts</span>
                  <ShortcutHint
                    keys={shortcutsHelpKeys}
                    compact
                    decorative
                    className="ml-auto"
                  />
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

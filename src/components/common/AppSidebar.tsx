import {
  Check,
  CheckSquare,
  ChevronUp,
  FolderKanban,
  Keyboard,
  LayoutDashboard,
  Laptop,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserCircle,
  SettingsIcon,
  Users,
  UserPlus,
} from "lucide-react"

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
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import { setTheme, type Theme } from "../../app/slice/themeSlice"
import { logout } from "@/features/auth/slice/authSlice"
import { clearUser } from "@/features/users/slice/user.slice"
import { LogoutUser } from "@/features/auth/services/auth.service"
import { clearProjects } from "@/features/projects/slice/projectSlice"

import type { LucideIcon } from "lucide-react"
import { useEffect } from "react"

import { getShortcut } from "@/config/keyboardShortcuts"
import { useKeyboardShortcutsUI } from "@/context/KeyboardShortcutsContext"
import { formatShortcutKey, toAriaKeyShortcuts } from "@/lib/keyboard"
import { clearTasks } from "@/features/tasks/slice/task.slice";
import { clearProjectMembers } from "@/features/projects/slice/projectMemberSlice";
import { queryClient } from "@/lib/queryClient"

const shortcutsHelpKeys = getShortcut("global.shortcuts")?.keys ?? ["mod", "/"]

type AppRole = "ADMIN" | "MANAGER" | "USER"

interface NavigationItem {
  title: string
  url: string
  icon: LucideIcon
}

const dashboardNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    url: "/app/projects",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    url: "/app/tasks",
    icon: CheckSquare,
  },
]

const roleNavigation: Record<AppRole, NavigationItem[]> = {
  ADMIN: [
    {
      title: "Users",
      url: "/app/users",
      icon: Users,
    },
  ],
  MANAGER: [
    {
      title: "Create User",
      url: "/app/users/create",
      icon: UserPlus,
    },
  ],
  USER: [],
}

const accountNavigation: NavigationItem[] = [
  {
    title: "Profile",
    url: "/app/profile",
    icon: UserCircle,
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: SettingsIcon,
  },
]

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
  const { openShortcuts } = useKeyboardShortcutsUI()
  const { pathname } = useLocation();

  const userRole = user?.user_role?.toUpperCase() as AppRole | undefined
  useEffect(() => {
    console.log(userRole)
  }, [userRole])
  const workspaceNavigation = [
    ...dashboardNavigation,
    ...(userRole && userRole in roleNavigation ? roleNavigation[userRole] : []),
  ]

  const theme = useAppSelector((state) => state.theme.theme)

  const initials = getInitials(user?.firstName, user?.lastName)

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User"

  const handleThemeChange = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme))
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
    if (url === "/app/dashboard") {
      return pathname === "/app/dashboard"
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border bg-sidebar">
      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}

      <SidebarHeader className="border-b border-sidebar-border/60 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<NavLink to="/app/dashboard" onClick={handleNavClick} />}
              size="lg"
              tooltip="DevFlow"
              className="hover:bg-sidebar-accent/70 transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
            >
              <div className="flex size-8 shrink-0 items-center justify-center text-primary-foreground shadow-xs">
                <img
                  src="/logo.png"
                  alt="DevFlow"
                  width="24"
                  height="24"
                  className=" object-contain"
                />
              </div>

              <div className="flex flex-1 items-center gap-1.5 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <p className="text-base font-semibold tracking-tight text-sidebar-foreground">DevFlow</p>

                <Badge
                  variant="outline"
                  className="font-mono text-[10px] font-medium border-sidebar-border/80 px-1.5 py-0"
                >
                  v{import.meta.env.VITE_APP_VERSION}
                </Badge>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ----------------------------------------- */}
      {/* Main Navigation */}
      {/* ----------------------------------------- */}

      <SidebarContent className="gap-2 py-2">
        {/* Workspace */}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2 py-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workspaceNavigation.map((item) => {
                const Icon = item.icon
                const active = isRouteActive(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={
                        <NavLink
                          to={item.url}
                          end={item.url === "/app/dashboard"}
                          onClick={handleNavClick}
                        />
                      }
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        "relative flex items-center rounded-lg font-medium transition-all duration-150",
                        active
                          ? "!bg-primary !text-primary-foreground font-semibold shadow-xs hover:!bg-primary/90 hover:!text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0 transition-colors", active ? "!text-primary-foreground" : "text-muted-foreground")} />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 px-2 py-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {accountNavigation.map((item) => {
                const Icon = item.icon
                const active = isRouteActive(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<NavLink to={item.url} onClick={handleNavClick} />}
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        "relative flex items-center rounded-lg font-medium transition-all duration-150",
                        active
                          ? "!bg-primary !text-primary-foreground font-semibold shadow-xs hover:!bg-primary/90 hover:!text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0 transition-colors", active ? "!text-primary-foreground" : "text-muted-foreground")} />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ----------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------- */}

      <SidebarFooter>
        <SidebarMenu>
          {/* ------------------------------------- */}
          {/* Theme */}
          {/* ------------------------------------- */}

          <SidebarMenuItem className="px-2 py-1">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Appearance"
                    className="bg-muted/50 hover:bg-muted group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!"
                  />
                }
              >
                {theme === "light" ? (
                  <Sun />
                ) : theme === "dark" ? (
                  <Moon />
                ) : (
                  <Laptop />
                )}

                <span className="group-data-[collapsible=icon]:hidden">Appearance</span>

                <ChevronUp className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-semibold">
                  Appearance
                </div>

                <DropdownMenuSeparator />

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
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* ------------------------------------- */}
          {/* User */}
          {/* ------------------------------------- */}

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

                <DropdownMenuItem render={<NavLink to="/app/profile" onClick={handleNavClick} />}>
                  <UserCircle className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem render={<NavLink to="/app/settings" onClick={handleNavClick} />}>
                  <Settings className="size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={openShortcuts}
                  aria-keyshortcuts={toAriaKeyShortcuts(shortcutsHelpKeys)}
                >
                  <Keyboard className="size-4" />
                  <span>Keyboard shortcuts</span>
                  <DropdownMenuShortcut aria-hidden="true">
                    {shortcutsHelpKeys.map(formatShortcutKey).join(" ")}
                  </DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

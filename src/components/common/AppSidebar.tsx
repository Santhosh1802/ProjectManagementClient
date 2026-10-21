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
  Palette,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Kbd } from "@/components/ui/kbd"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import { setTheme, setColorTheme, type Theme, type ColorTheme } from "../../app/slice/themeSlice"
import { logout } from "@/features/auth/slice/authSlice"
import { clearUser } from "@/features/users/slice/user.slice"
import { LogoutUser } from "@/features/auth/services/auth.service"
import { clearProjects } from "@/features/projects/slice/projectSlice"

import type { LucideIcon } from "lucide-react"

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
  shortcut?: string[]
}

const dashboardNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
    shortcut: ["G", "D"],
  },
  {
    title: "Projects",
    url: "/app/projects",
    icon: FolderKanban,
    shortcut: ["G", "P"],
  },
  {
    title: "Tasks",
    url: "/app/tasks",
    icon: CheckSquare,
    shortcut: ["G", "T"],
  },
]

const roleNavigation: Record<AppRole, NavigationItem[]> = {
  ADMIN: [
    {
      title: "Users",
      url: "/app/users",
      icon: Users,
      shortcut: ["G", "U"],
    },
  ],
  MANAGER: [
    {
      title: "Create User",
      url: "/app/users/create",
      icon: UserPlus,
      shortcut: ["C", "U"],
    },
  ],
  USER: [],
}

const accountNavigation: NavigationItem[] = [
  {
    title: "Profile",
    url: "/app/profile",
    icon: UserCircle,
    shortcut: ["G", "M"],
  },
  {
    title: "Settings",
    url: "/app/settings",
    icon: SettingsIcon,
    shortcut: ["G", "S"],
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
  const workspaceNavigation = [
    ...dashboardNavigation,
    ...(userRole && userRole in roleNavigation ? roleNavigation[userRole] : []),
  ]

  const theme = useAppSelector((state) => state.theme.theme)
  const colorTheme = useAppSelector((state) => state.theme.colorTheme || "indigo")

  const initials = getInitials(user?.firstName, user?.lastName)

  const fullName = user ? `${user.firstName} ${user.lastName}` : "User"

  const handleThemeChange = (selectedTheme: Theme) => {
    dispatch(setTheme(selectedTheme))
  }

  const handleColorThemeChange = (selectedColor: ColorTheme) => {
    dispatch(setColorTheme(selectedColor))
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

  const colorPresets: { id: ColorTheme; name: string; dotClass: string }[] = [
    { id: "indigo", name: "Indigo", dotClass: "bg-indigo-500" },
    { id: "slate", name: "Slate", dotClass: "bg-slate-500" },
    { id: "emerald", name: "Emerald", dotClass: "bg-emerald-500" },
    { id: "rose", name: "Rose", dotClass: "bg-rose-500" },
    { id: "zinc", name: "Zinc", dotClass: "bg-zinc-500" },
  ]

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/80 bg-sidebar transition-colors duration-300">
      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}

      <SidebarHeader className="border-b border-sidebar-border/60 p-2.5">
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
                    <span className="text-[10px] text-muted-foreground font-medium">Project Workspace</span>
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
      </SidebarHeader>

      {/* ----------------------------------------- */}
      {/* Main Navigation */}
      {/* ----------------------------------------- */}

      <SidebarContent className="gap-2 py-3 px-1">
        {/* Workspace */}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
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
                        "group/nav relative flex items-center rounded-lg px-2.5 py-2 font-medium transition-all duration-200",
                        active
                          ? "!bg-primary !text-primary-foreground font-semibold shadow-sm shadow-primary/25 hover:!bg-primary/95 hover:!text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground hover:translate-x-0.5"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0 transition-transform duration-200 group-hover/nav:scale-110", active ? "!text-primary-foreground" : "text-muted-foreground group-hover/nav:text-primary")} />
                      <span className="truncate">{item.title}</span>
                      {item.shortcut && (
                        <span className="ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline-flex items-center gap-0.5 opacity-60 group-hover/nav:opacity-100 transition-opacity">
                          {item.shortcut.map((key, i) => (
                            <Kbd
                              key={i}
                              className={cn(
                                "h-4 min-w-4 px-1 text-[9px] font-mono leading-none rounded-xs border",
                                active
                                  ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                                  : "bg-muted/70 text-muted-foreground border-border/50"
                              )}
                            >
                              {key}
                            </Kbd>
                          ))}
                        </span>
                      )}
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-foreground/90 transition-all group-data-[collapsible=icon]:hidden" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2 py-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
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
                        "group/nav relative flex items-center rounded-lg px-2.5 py-2 font-medium transition-all duration-200",
                        active
                          ? "!bg-primary !text-primary-foreground font-semibold shadow-sm shadow-primary/25 hover:!bg-primary/95 hover:!text-primary-foreground data-[active=true]:!bg-primary data-[active=true]:!text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-foreground hover:translate-x-0.5"
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0 transition-transform duration-200 group-hover/nav:scale-110", active ? "!text-primary-foreground" : "text-muted-foreground group-hover/nav:text-primary")} />
                      <span className="truncate">{item.title}</span>
                      {item.shortcut && (
                        <span className="ml-auto hidden group-data-[collapsible=icon]:hidden lg:inline-flex items-center gap-0.5 opacity-60 group-hover/nav:opacity-100 transition-opacity">
                          {item.shortcut.map((key, i) => (
                            <Kbd
                              key={i}
                              className={cn(
                                "h-4 min-w-4 px-1 text-[9px] font-mono leading-none rounded-xs border",
                                active
                                  ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                                  : "bg-muted/70 text-muted-foreground border-border/50"
                              )}
                            >
                              {key}
                            </Kbd>
                          ))}
                        </span>
                      )}
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary-foreground/90 transition-all group-data-[collapsible=icon]:hidden" />
                      )}
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

      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <SidebarMenu className="gap-1">
          {/* ------------------------------------- */}
          {/* Theme */}
          {/* ------------------------------------- */}

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
                  {theme === "light" ? (
                    <Sun className="size-4" />
                  ) : theme === "dark" ? (
                    <Moon className="size-4" />
                  ) : (
                    <Laptop className="size-4" />
                  )}
                </div>

                <div className="flex flex-1 items-center justify-between text-xs group-data-[collapsible=icon]:hidden">
                  <span>Theme & Color</span>
                  <span className="capitalize font-mono text-[10px] text-muted-foreground">{colorTheme}</span>
                </div>

                <ChevronUp className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Interface Mode
                </div>

                <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                  <Sun className="size-4" />
                  <span>Light</span>
                  {theme === "light" && <Check className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                  <Moon className="size-4" />
                  <span>Dark</span>
                  {theme === "dark" && <Check className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                  <Laptop className="size-4" />
                  <span>System</span>
                  {theme === "system" && <Check className="ml-auto size-4 text-primary" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Submenu for Theme Color presets */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Palette className="size-4 text-primary" />
                    <span>Accent Palette</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-44">
                    {colorPresets.map((preset) => (
                      <DropdownMenuItem
                        key={preset.id}
                        onClick={() => handleColorThemeChange(preset.id)}
                        className="flex items-center gap-2"
                      >
                        <span className={cn("size-3 rounded-full ring-1 ring-border", preset.dotClass)} />
                        <span>{preset.name}</span>
                        {colorTheme === preset.id && <Check className="ml-auto size-4 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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

import {
  Check,
  CheckSquare,
  ChevronUp,
  FolderKanban,
  LayoutDashboard,
  Laptop,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserCircle,
  SettingsIcon,
} from "lucide-react"

import { NavLink, useNavigate } from "react-router-dom"

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
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback } from "../ui/avatar"

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

import { setTheme, type Theme } from "../../app/slice/themeSlice"
import { Separator } from "../ui/separator"
import { logout } from "@/features/auth/slice/authSlice"
import { clearUser } from "@/features/users/slice/user.slice"
import { LogoutUser } from "@/features/auth/services/auth.service"

const workspaceNavigation = [
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

const accountNavigation = [
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
      dispatch(logout())
      dispatch(clearUser())
      navigate("/login", { replace: true })
    }
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="bg-muted">
      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<NavLink to="/app/dashboard" />}
              size="lg"
              tooltip="DevFlow"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <img src="/logo.png" alt="DevFlow" width="40" height="40" />
              </div>

              <div className="flex flex-1 items-center gap-1 text-left text-sm leading-tight">
                <p className="text-lg font-semibold">DevFlow</p>

                <Badge
                  variant="outline"
                  className="font-mono text-xs font-light"
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

      <SidebarContent>
        {/* Workspace */}

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceNavigation.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={
                        <NavLink
                          to={item.url}
                          end={item.url === "/app/dashboard"}
                        />
                      }
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavigation.map((item) => {
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={<NavLink to={item.url} />}
                      tooltip={item.title}
                    >
                      <Icon />
                      <span>{item.title}</span>
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

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Appearance"
                    className="bg-muted/50 hover:bg-muted"
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

                <span>Appearance</span>

                <ChevronUp className="ml-auto size-4 text-muted-foreground" />
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

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={fullName}
                    className="bg-muted"
                  />
                }
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>

                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email ?? "No email"}
                  </span>
                </div>

                <ChevronUp className="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">
                  My Account
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem render={<NavLink to="/app/profile" />}>
                  <UserCircle className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem render={<NavLink to="/app/settings" />}>
                  <Settings className="size-4" />
                  <span>Settings</span>
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

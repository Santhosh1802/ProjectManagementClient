import {
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";

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
} from "@/components/ui/sidebar";

import { Badge } from "../ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "../ui/avatar";

import { useAppSelector } from "@/hooks/redux-hooks";

const mainNavigation = [
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
  {
    title: "Profile",
    url: "/app/profile",
    icon: UserCircle,
  },
];

function getInitials(
  firstName?: string,
  lastName?: string
) {
  if (!firstName && !lastName) {
    return "?";
  }

  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default function AppSidebar() {
  const location = useLocation();

  const user = useAppSelector(
    (state) => state.auth.user
  );

  const isActiveRoute = (url: string) => {
    return (
      location.pathname === url ||
      location.pathname.startsWith(`${url}/`)
    );
  };

  const initials = getInitials(
    user?.firstName,
    user?.lastName
  );

  const fullName = user
    ? `${user.firstName} ${user.lastName}`
    : "User";

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="bg-muted"
    >
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <NavLink to="/app/dashboard" />
              }
              size="lg"
              tooltip="DevFlow"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <img
                  src="/logo.png"
                  alt="DevFlow"
                  width="40"
                  height="40"
                />
              </div>

              <div className="flex flex-1 items-center gap-1 text-left text-sm leading-tight">
                <p className="text-lg font-semibold">
                  DevFlow
                </p>

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

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Workspace
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const Icon = item.icon;

                const isActive = isActiveRoute(
                  item.url
                );

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      render={
                        <NavLink to={item.url} />
                      }
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Icon />

                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={fullName}
              className="bg-muted"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback>
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {fullName}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {user?.email ?? "No email"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
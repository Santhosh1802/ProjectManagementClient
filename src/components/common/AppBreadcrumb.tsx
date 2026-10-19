import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectDetailQuery } from "@/features/projects/hooks/useProjectsQuery";
import { useTaskDetailQuery } from "@/features/tasks/hooks/useTasksQuery";
import { useUserDetailQuery } from "@/features/users/hooks/useUsersQuery";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  users: "Users",
  profile: "Profile",
  settings: "Settings",
  create: "Create",
  new: "New Project",
  members: "Members",
  activity: "Activity",
};

export default function AppBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);
  const appIndex = segments.indexOf("app");
  const routeSegments = appIndex !== -1 ? segments.slice(appIndex + 1) : segments;

  // Identify dynamic resource IDs from URL segments
  const projectIdx = routeSegments.indexOf("projects");
  const projectId = projectIdx !== -1 && routeSegments[projectIdx + 1] && routeSegments[projectIdx + 1] !== "create"
    ? routeSegments[projectIdx + 1]
    : undefined;

  const taskIdx = routeSegments.indexOf("tasks");
  const taskId = taskIdx !== -1 && routeSegments[taskIdx + 1] && routeSegments[taskIdx + 1] !== "create"
    ? routeSegments[taskIdx + 1]
    : undefined;

  const userIdx = routeSegments.indexOf("users");
  const userId = userIdx !== -1 && routeSegments[userIdx + 1] && routeSegments[userIdx + 1] !== "create"
    ? routeSegments[userIdx + 1]
    : undefined;

  const { data: projectData, isLoading: projectLoading } = useProjectDetailQuery(projectId, { enabled: Boolean(projectId) });
  const { data: taskData, isLoading: taskLoading } = useTaskDetailQuery(taskId, { enabled: Boolean(taskId) });
  const { data: userData, isLoading: userLoading } = useUserDetailQuery(userId, { enabled: Boolean(userId) });

  const isSegmentLoading = (segment: string, index: number) => {
    const prevSegment = index > 0 ? routeSegments[index - 1] : "";
    if (prevSegment === "projects" && segment === projectId) return projectLoading && !projectData;
    if (prevSegment === "tasks" && segment === taskId) return taskLoading && !taskData;
    if (prevSegment === "users" && segment === userId) return userLoading && !userData;
    return false;
  };

  const getSegmentLabel = (segment: string, index: number) => {
    const prevSegment = index > 0 ? routeSegments[index - 1] : "";

    if (prevSegment === "projects" && segment === projectId) {
      return projectData?.name ?? segment;
    }

    if (prevSegment === "tasks" && segment === taskId) {
      return taskData?.title ?? segment;
    }

    if (prevSegment === "users" && segment === userId) {
      if (userData) {
        return [userData.firstName, userData.lastName].filter(Boolean).join(" ") || userData.email || segment;
      }
      return segment;
    }

    return (
      routeNames[segment] ??
      segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };

  return (
    <TooltipProvider>
      <Breadcrumb className="min-w-0 max-w-full overflow-hidden">
        <BreadcrumbList className="flex-nowrap min-w-0 overflow-hidden">
          {/* Home / Dashboard link */}
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbLink render={<Link to="/app/dashboard" />}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {routeSegments.map((segment, index) => {
            const isLast = index === routeSegments.length - 1;
            const path = "/app/" + routeSegments.slice(0, index + 1).join("/");
            const loading = isSegmentLoading(segment, index);
            const label = getSegmentLabel(segment, index);

            if (loading) {
              return (
                <Fragment key={path}>
                  <BreadcrumbSeparator className="shrink-0" />
                  <BreadcrumbItem className="min-w-0 shrink">
                    <Skeleton className="h-4 w-20 sm:w-28 rounded-md" />
                  </BreadcrumbItem>
                </Fragment>
              );
            }

            const content = isLast ? (
              <BreadcrumbPage className="block min-w-0 max-w-[120px] truncate sm:max-w-[200px] md:max-w-[300px]">
                {label}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                className="block min-w-0 max-w-[90px] truncate sm:max-w-[150px] md:max-w-[220px]"
                render={<Link to={path} />}
              >
                {label}
              </BreadcrumbLink>
            );

            return (
              <Fragment key={path}>
                <BreadcrumbSeparator className="shrink-0" />
                <BreadcrumbItem className="min-w-0 shrink">
                  <Tooltip>
                    <TooltipTrigger render={content}>
                      {label}
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  );
}
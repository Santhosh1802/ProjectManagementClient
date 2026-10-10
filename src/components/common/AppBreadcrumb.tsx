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

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  profile: "Profile",
  new: "New Project",
  members: "Members",
  activity: "Activity",
};

// Check if string is a UUID (or just very long)
const isLongId = (str: string) => str.length > 20;

export default function AppBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  const appIndex = segments.indexOf("app");

  const routeSegments =
    appIndex !== -1 ? segments.slice(appIndex + 1) : segments;

  return (
    <TooltipProvider>
      <Breadcrumb>
        <BreadcrumbList className="flex-nowrap">
          {/* Home */}
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbLink
              render={<Link to="/app/dashboard" />}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {routeSegments.map((segment, index) => {
            const isLast = index === routeSegments.length - 1;

            const path =
              "/app/" + routeSegments.slice(0, index + 1).join("/");

            const name =
              routeNames[segment] ??
              segment
                .replace(/-/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());

            const needsTooltip = isLongId(segment);
            
            const content = isLast ? (
              <BreadcrumbPage className="block max-w-[100px] truncate sm:max-w-[150px] md:max-w-[250px]">
                {name}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                className="block max-w-[100px] truncate sm:max-w-[150px] md:max-w-[250px]"
                render={<Link to={path} />}
              >
                {name}
              </BreadcrumbLink>
            );

            return (
              <div key={path} className="contents">
                <BreadcrumbSeparator className="shrink-0" />

                <BreadcrumbItem className="min-w-0 shrink">
                  {needsTooltip ? (
                    <Tooltip>
                      <TooltipTrigger render={content}>
                        {name}
                      </TooltipTrigger>
                      <TooltipContent>{name}</TooltipContent>
                    </Tooltip>
                  ) : (
                    content
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  );
}
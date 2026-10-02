import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  tasks: "Tasks",
  profile: "Profile",
  new: "New Project",
  members: "Members",
  activity: "Activity",
};

export default function AppBreadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  const appIndex = segments.indexOf("app");

  const routeSegments =
    appIndex !== -1 ? segments.slice(appIndex + 1) : segments;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
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

          return (
            <div key={path} className="contents">
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={path} />}
                  >
                    {name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import AppLoader from "@/components/common/AppLoader"
import PublicLayout from "@/components/layout/PublicLayout"
import AppLayout from "@/components/layout/AppLayout"
import RoleGuard from "@/components/layout/RoleGaurd"
import { ROUTE_ROLES } from "@/config/routeAccess"
import UserDetailsPage from "@/pages/app/UserDetailsPage"

// Public pages
const HomePage = lazy(() => import("@/pages/public/HomePage"))
const LoginPage = lazy(() => import("@/pages/public/LoginPage"))
const RegisterPage = lazy(() => import("@/pages/public/RegisterPage"))
const TermsOfService = lazy(() => import("@/pages/public/TermsOfService"))
const Policies = lazy(() => import("@/pages/public/Policies"))
const PublicNotFoundPage = lazy(
  () => import("@/pages/public/PublicNotFoundPage")
)

// App pages
const Dashboard = lazy(() => import("@/pages/app/Dashboard"))
const ProfilePage = lazy(() => import("@/pages/app/ProfilePage"))
const ProjectPage = lazy(() => import("@/pages/app/ProjectPage"))
const ProjectDetailsPage = lazy(() => import("@/pages/app/ProjectDetailsPage"))
const ProjectMembersPage = lazy(() => import("@/pages/app/ProjectMembersPage"))
const ProjectTasksPage = lazy(() => import("@/pages/app/ProjectTasksPage"))
const UsersPage = lazy(() => import("@/pages/app/UsersPage"))
const CreateUserPage = lazy(() => import("@/pages/app/CreateUserPage"))
const CreateProjectPage = lazy(() => import("@/pages/app/CreateProjectPage"))
const TaskPage = lazy(() => import("@/pages/app/TaskPage"))
const CreateTaskPage = lazy(() => import("@/pages/app/CreateTaskPage"))
const TaskDetailsPage = lazy(() => import("@/pages/app/TaskDetailsPage"))

const Settings = lazy(() => import("@/pages/app/Settings"))
const AppNotFoundPage = lazy(() => import("@/pages/app/AppNotFoundPage"))

export default function AppRoutes() {
  return (
    <Suspense fallback={<AppLoader message="Loading DevFlow..." />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<Policies />} />
          <Route path="*" element={<PublicNotFoundPage />} />
        </Route>

        {/* Application routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="projects" element={<ProjectPage />} />
          <Route path="projects/create" element={<CreateProjectPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
          <Route
            path="projects/:projectId/members"
            element={<ProjectMembersPage />}
          />
          <Route
            path="projects/:projectId/tasks"
            element={<ProjectTasksPage />}
          />
          <Route path="tasks" element={<TaskPage />} />
          <Route path="tasks/create" element={<CreateTaskPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailsPage />} />
          <Route element={<RoleGuard allowedRoles={ROUTE_ROLES.userManagement} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route element={<RoleGuard allowedRoles={ROUTE_ROLES.userAdministration} />}>
            <Route path="users/create" element={<CreateUserPage />} />
            <Route path="users/:userId" element={<UserDetailsPage />} />
          </Route>
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<AppNotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

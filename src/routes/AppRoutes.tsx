import { Route, Routes } from "react-router-dom"

import HomePage from "@/pages/public/HomePage"
import TermsOfService from "@/pages/public/TermsOfService"
import Policies from "@/pages/public/Policies"
import PublicLayout from "@/components/layout/PublicLayout"
import LoginPage from "@/pages/public/LoginPage"
import RegisterPage from "@/pages/public/RegisterPage"

import AppLayout from "@/components/layout/AppLayout"
import Dashboard from "@/pages/app/Dashboard"
import ProfilePage from "@/pages/app/ProfilePage"
import ProjectPage from "@/pages/app/ProjectPage"
import TaskPage from "@/pages/app/TaskPage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<Policies />} />
      </Route>
      <Route path="/app" element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="projects" element={<ProjectPage />} />
        <Route path="tasks" element={<TaskPage />} />
      </Route>
    </Routes>
  )
}

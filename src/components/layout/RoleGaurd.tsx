
import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "@/hooks/redux-hooks"

type AppRole = "ADMIN" | "MANAGER" | "USER"

interface RoleGuardProps {
  allowedRoles: AppRole[]
}

export default function RoleGuard({
  allowedRoles,
}: RoleGuardProps) {
  const user = useAppSelector((state) => state.auth.user)

  const role = user?.user_role?.toUpperCase()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!role || !allowedRoles.includes(role as AppRole)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}

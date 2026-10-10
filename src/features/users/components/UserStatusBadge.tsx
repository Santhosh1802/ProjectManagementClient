import { Badge } from "@/components/ui/badge";
import type { UserRole } from "../types/user.types";

interface UserStatusBadgeProps {
  status: UserRole | "active" | "inactive" | "verified" | "unverified";
}

const labels: Record<UserStatusBadgeProps["status"], string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  USER: "User",
  active: "Active",
  inactive: "Inactive",
  verified: "Verified",
  unverified: "Unverified",
};

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {
  return (
    <Badge variant="outline">
      {labels[status]}
    </Badge>
  );
}
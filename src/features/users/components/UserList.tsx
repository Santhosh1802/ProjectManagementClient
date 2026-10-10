import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { User } from "../types/user.types";
import UserStatusBadge from "./UserStatusBadge";
import { formatUserDate, getUserInitials, getUserName } from "../utils/user.utils";

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="space-y-3">
      {users.map((user) => (
        <Card
          key={user.id}
          className="p-4 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start gap-3">
            <Avatar className="size-11">
              <AvatarFallback>{getUserInitials(user) || "U"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h3 className="truncate font-semibold">{getUserName(user)}</h3>
                <p className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <UserStatusBadge status={user.userRole} />
                <UserStatusBadge status={user.isActive ? "active" : "inactive"} />
                <UserStatusBadge
                  status={user.emailVerified ? "verified" : "unverified"}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Joined {formatUserDate(user.createdAt)}
              </p>
            </div>

            <Button size="icon" variant="outline" aria-label={`View ${getUserName(user)}`} render={<Link to={`/app/users/${user.id}`} />}>
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
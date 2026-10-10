import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { User } from "../types/user.types";
import UserStatusBadge from "./UserStatusBadge";
import { formatUserDate, getUserInitials, getUserName } from "../utils/user.utils";

interface UserCardProps {
  user: User;
}



export default function UserCard({ user }: UserCardProps) {
  return (
    <Card className="h-full transition-shadow duration-200 hover:shadow-md motion-reduce:transition-none">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <Avatar className="size-11">
          <AvatarFallback>{getUserInitials(user) || "U"}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{getUserName(user)}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>

        <Button size="icon" variant="ghost" aria-label="View user" render={<Link to={`/app/users/${user.id}`} />}>
          <ArrowUpRight className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <UserStatusBadge status={user.userRole} />
          <UserStatusBadge status={user.isActive ? "active" : "inactive"} />
        </div>

        <Separator />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span>Email verification</span>
            <span className="ml-auto text-foreground">
              <UserStatusBadge
                status={user.emailVerified ? "verified" : "unverified"}
              />
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>Joined</span>
            <span className="ml-auto text-foreground">
              {formatUserDate(user.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import { Link } from "react-router-dom";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "../types/user.types";
import UserStatusBadge from "./UserStatusBadge";
import { formatUserDate, getUserInitials, getUserName } from "../utils/user.utils";


interface UserTableProps {
  users: User[];
  onDelete: (user: User) => void;
  canDelete?: (user: User) => boolean;
}

export default function UserTable({
  users,
  onDelete,
  canDelete = () => true,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>
                      {getUserInitials(user) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="max-w-48 truncate font-medium">
                      {getUserName(user)}
                    </p>
                    <p className="max-w-48 truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <UserStatusBadge status={user.userRole} />
              </TableCell>

              <TableCell>
                <UserStatusBadge status={user.isActive ? "active" : "inactive"} />
              </TableCell>

              <TableCell>
                <UserStatusBadge
                  status={user.emailVerified ? "verified" : "unverified"}
                />
              </TableCell>

              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatUserDate(user.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${getUserName(user)}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>}/>
                    
                  

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem >
                      <Link to={`/app/users/${user.id}`}>
                        <ArrowUpRight className="mr-2 size-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>

                    {canDelete(user) && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={() => onDelete(user)}
                      >
                        Delete user
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
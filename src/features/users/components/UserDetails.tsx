import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, DotSquareIcon, Lock } from "lucide-react"
import { formatDateTime } from "@/lib/dateConverter"

type UserDetailsProps = {
    id:string,
    firstName:string,
    lastName:string,
    email:string,
    userRole:string,
    isActive:boolean,
    emailVerified:boolean,
    createdAt:string,
    updatedAt:string,
    lastLoginAt:string,
}

export default function UserDetails({firstName,lastName,userRole,email,emailVerified,isActive,createdAt}:UserDetailsProps) {
  
  return (
    <div className="flex h-[20vh] w-full flex-row items-center justify-between rounded-md border-2 p-4">
      <div className="flex flex-row gap-4 items-center justify-center">
        <Avatar className="bg-muted p-10">
          <AvatarFallback>{firstName[0].toUpperCase()+lastName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-row gap-2">
            <p>{firstName}</p>
            <p>{lastName}</p>
            <Badge>{userRole}</Badge>
          </div>
          <div>
            <p className="text-sm">{email}</p>
          </div>
          <div className="flex flex-row gap-2">
            <Badge className={isActive ? "bg-green-400" : "bg-red-400"}>
              <DotSquareIcon />
              {isActive ? "Active" : "In-Active"} Account
            </Badge>
            <Badge
              className={emailVerified ? "bg-green-400" : "bg-red-400"}
            >
              <Check />
              {emailVerified ? "Verified" : "Un-Verified"} Identity
            </Badge>
            <Badge
              className={emailVerified ? "bg-green-400" : "bg-red-400"}
            >
              <Lock /> MFA {emailVerified ? "Enforced" : "Not-Enforced"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-right">
        <div>
          <p className="text-xs text-muted-foreground">CREATED</p>
          <p className="text-xs">
            {formatDateTime(createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">LAST OBSERVED LOGIN</p>
          <p className="text-xs">
            {formatDateTime(createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

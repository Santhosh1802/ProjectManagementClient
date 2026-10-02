import PersonalInfo from "@/features/users/components/PersonalInfo";
import UserDetails from "@/features/users/components/UserDetails";
import { getUserByEmail } from "@/features/users/services/users.service";
import type { User } from "@/features/users/types/user.types";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const email = localStorage.getItem("email") || ""
  const [user, setUser] = useState<User>({
    id: "",
    firstName: "FN",
    lastName: "LN",
    email: "",
    userRole: "",
    isActive: false,
    emailVerified: false,
    createdAt: "",
    updatedAt: "",
    lastLoginAt: "",
  })
  useEffect(() => {
    async function getUser() {
      try {
        console.log(email)

        const response = await getUserByEmail({ email: email })
        console.log(response)
        setUser(response.data.data)
      } catch (error) {
        console.log(error)
      }
    }
    getUser()
  }, [email])
  return (
    <div>
        <UserDetails  />
        <PersonalInfo/>
    </div>
  )
}

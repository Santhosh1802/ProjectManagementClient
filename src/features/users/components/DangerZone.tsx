import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { deleteUser } from "@/features/users/services/users.service"
import { LogoutUser } from "@/features/auth/services/auth.service"
import { logout } from "@/features/auth/slice/authSlice"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"

interface DangerZoneProps {
  userId?: string
}

export default function DangerZone({ userId }: DangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentAuthUser = useAppSelector((state) => state.auth.user)
  const targetUserId = userId || currentAuthUser?.id

  async function handleDeleteAccount() {
    if (!targetUserId) return

    try {
      setIsDeleting(true)
      await deleteUser({ id: targetUserId })

      toast.add({
        type: "success",
        title: "Account deleted",
        description: "Your account and data have been removed.",
      })

      // If user is deleting their own account, log out and redirect to login
      if (currentAuthUser?.id === targetUserId) {
        try {
          await LogoutUser()
        } catch {
          // ignore network failure on logout
        }
        dispatch(logout())
        navigate("/login", { replace: true })
      }
      setOpen(false)
    } catch (error) {
      toast.add({
        type: "error",
        title: "Deletion failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting your account.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="w-full overflow-hidden rounded-xl border-destructive/30">
      {/* ----------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------- */}

      <CardHeader className="w-full border-b border-destructive/10 bg-destructive/5 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Icon */}

          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>

          {/* Heading */}

          <div className="min-w-0">
            <CardTitle className="text-sm font-semibold text-destructive">
              Danger Zone
            </CardTitle>

            <CardDescription className="mt-1 text-xs">
              Irreversible and destructive account actions.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* ----------------------------------------- */}
      {/* Content */}
      {/* ----------------------------------------- */}

      <CardContent className="w-full p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Description */}

          <div className="min-w-0 space-y-1">
            <h3 className="text-sm font-semibold">Delete your account</h3>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Permanently delete your account and all associated workspace data.
              This action cannot be undone.
            </p>
          </div>

          {/* ------------------------------------- */}
          {/* Confirmation Dialog */}
          {/* ------------------------------------- */}

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="shrink-0 sm:self-center gap-2"
                />
              }
            >
              <Trash2 className="size-4" />
              Delete Account
            </AlertDialogTrigger>

            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-5 shrink-0" />
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                </div>

                <AlertDialogDescription className="text-left pt-1.5 text-sm">
                  This action cannot be undone. This will permanently delete
                  your account and remove your associated workspace data from
                  our systems.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="gap-3 pt-3 border-t">
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>

                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4" />
                      Yes, Delete Account
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>

      {/* ----------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------- */}

      <CardFooter className="w-full border-t border-destructive/10 bg-destructive/3 px-5 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-destructive">Warning:</span> Account
          deletion is permanent. Make sure you have exported anything you need
          before continuing.
        </p>
      </CardFooter>
    </Card>
  )
}

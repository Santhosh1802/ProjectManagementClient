import { AlertTriangle, Loader2, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
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

import { useState } from "react"

export default function DangerZone() {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDeleteAccount() {
    try {
      setIsDeleting(true)

      /*
       * TODO:
       *
       * await deleteUser({
       *   id: userId,
       * });
       */

      console.log("Deleting user...")
    } catch (error) {
      console.error("Failed to delete account:", error)
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

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  className="shrink-0 sm:self-center"
                />
              }
            >
              <Trash2 className="size-4" />
              Delete Account
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your associated workspace data from
                  our systems.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className=" bg-destructive hover:bg-destructive/90"
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
                </AlertDialogAction>
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

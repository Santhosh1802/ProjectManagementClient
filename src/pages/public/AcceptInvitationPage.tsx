import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Building2, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSelector } from "@/hooks/redux-hooks"
import { useAcceptInvitationMutation } from "@/features/workspaces/hooks/useWorkspaces"

export default function AcceptInvitationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const { mutate: acceptInvite, isPending, isSuccess, error } = useAcceptInvitationMutation()

  const handleAccept = () => {
    if (!token) return
    acceptInvite(
      { token },
      {
        onSuccess: () => {
          setTimeout(() => {
            navigate("/app/dashboard", { replace: true })
          }, 1500)
        },
      }
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              No invitation token was found in this link. Please check your email or contact your organization admin for a new link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => navigate("/login")}>Go to Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/70">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2 shadow-xs">
            <Building2 className="size-6" />
          </div>
          <CardTitle className="text-xl">Workspace Invitation</CardTitle>
          <CardDescription>
            You have been invited to join an organization on DevFlow.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-4 text-center">
              <CheckCircle2 className="size-10 text-emerald-500 animate-in zoom-in" />
              <h3 className="font-semibold text-base">Invitation Accepted!</h3>
              <p className="text-xs text-muted-foreground">
                Redirecting you to your new organization workspace...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {error instanceof Error
                      ? error.message
                      : "Failed to accept invitation. The invitation may be expired or invalid."}
                  </span>
                </div>
              )}

              {isAuthenticated ? (
                <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs space-y-1">
                  <span className="text-muted-foreground">Signed in as:</span>
                  <p className="font-semibold text-foreground">{user?.email}</p>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">Authentication Required</p>
                  <p>
                    Please log in or create an account with the invited email address to accept this workspace invitation.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          {!isSuccess && (
            <>
              {isAuthenticated ? (
                <Button
                  onClick={handleAccept}
                  disabled={isPending}
                  className="w-full gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Accept & Join Workspace
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      navigate("/login", {
                        state: { from: `/invite/accept?token=${token}` },
                      })
                    }
                  >
                    Log In
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() =>
                      navigate("/register", {
                        state: { from: `/invite/accept?token=${token}` },
                      })
                    }
                  >
                    Register
                  </Button>
                </div>
              )}
            </>
          )}

          <Link
            to="/app/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground text-center mt-2"
          >
            Back to Dashboard
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

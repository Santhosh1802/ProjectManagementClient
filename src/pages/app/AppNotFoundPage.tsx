import {
  ArrowLeft,
  FolderKanban,
  Home,
  SearchX,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

export default function AppNotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-[calc(90vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl shadow-sm">
        <CardHeader className="flex flex-col items-center text-center justify-center
        gap-2">
          <div className="mb-5 flex flex-row size-16 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="size-8 text-muted-foreground" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Error 404
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            We couldn't find that page
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            The project, task, or page you're trying to access doesn't exist,
            or you may no longer have access to it.
          </p>
        </CardHeader>

        <CardContent>
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-lg border bg-muted/40 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background">
              <FolderKanban className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 text-left">
              <p className="text-sm font-medium">
                Looking for something?
              </p>

              <p className="text-xs leading-5 text-muted-foreground">
                Head back to your workspace and continue where you left off.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            className="w-full sm:w-auto"
            onClick={() => navigate("/app/dashboard")}
          >
            <Home className="size-4" />
            Go to dashboard
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            Go back
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
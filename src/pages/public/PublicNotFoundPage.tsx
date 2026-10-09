import { ArrowLeft, SearchX } from "lucide-react"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

export default function PublicNotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg border-border/60 shadow-sm">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="mb-4 flex flex-row size-16 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="size-8 text-muted-foreground" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Error 404
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Page not found
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            The page you're looking for doesn't exist or may have been moved
            to another location.
          </p>
        </CardHeader>

        <CardContent />

        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button className="w-full sm:w-fit">
            <Link to="/">
              Go to homepage
            </Link>
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
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Trash2 } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { useDeleteProjectMutation } from "@/features/projects/hooks/useProjectsQuery"
import { useAppDispatch } from "@/hooks/redux-hooks"
import { removeProject } from "@/features/projects/slice/projectSlice"
import type { Project } from "@/features/projects/types/project.types"

interface DeleteProjectDialogProps {
  project: Project
  trigger?: React.ReactNode
}

export default function DeleteProjectDialog({
  project,
  trigger,
}: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmName, setConfirmName] = useState("")
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const deleteMutation = useDeleteProjectMutation()

  const isConfirmed = confirmName.trim() === project.name.trim()

  const handleDelete = async () => {
    if (!isConfirmed) return

    try {
      await deleteMutation.mutateAsync({ id: project.id })
      dispatch(removeProject(project.id))
      toast.add({
        type: "success",
        title: "Project deleted",
        description: `Project "${project.name}" has been permanently deleted.`,
      })
      setOpen(false)
      navigate("/app/projects", { replace: true })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Failed to delete project",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting the project.",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => {
      setOpen(nextOpen)
      if (!nextOpen) setConfirmName("")
    }}>
      <AlertDialogTrigger render={
        trigger ? (
          trigger as React.ReactElement
        ) : (
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="size-4" />
            Delete Project
          </Button>
        )
      } />

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left pt-2 text-sm">
            This action cannot be undone. This will permanently delete the project{" "}
            <span className="font-semibold text-foreground">"{project.name}"</span>,
            including all its tasks, assigned members, and associated history.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2 text-left">
          <Label htmlFor="confirm-project-name" className="text-xs text-muted-foreground">
            Please type <span className="font-semibold text-foreground font-mono">{project.name}</span> to confirm:
          </Label>
          <Input
            id="confirm-project-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={project.name}
            autoComplete="off"
            className="font-mono text-sm"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || deleteMutation.isPending}
            className="gap-2"
          >
            {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

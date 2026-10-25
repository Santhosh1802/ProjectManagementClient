import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { savedViewKeys } from "@/lib/queryKeys"
import {
  getSavedViews,
  createSavedView,
  updateSavedView,
  deleteSavedView,
} from "../services/savedView.service"
import type {
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  ViewTarget,
} from "../types/savedView.types"
import { toast } from "@/components/ui/toast"

export function useSavedViewsQuery(target?: ViewTarget) {
  return useQuery({
    queryKey: savedViewKeys.byTarget(target),
    queryFn: () => getSavedViews(target),
    staleTime: 60 * 1000,
  })
}

export function useCreateSavedViewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateSavedViewRequest) => createSavedView(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
      toast.add({
        type: "success",
        title: "Saved View",
        description: `Saved view "${data.name}" created`,
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to create saved view"
      toast.add({
        type: "error",
        title: "Saved View",
        description: msg,
      })
    },
  })
}

export function useUpdateSavedViewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSavedViewRequest }) =>
      updateSavedView(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
      toast.add({
        type: "success",
        title: "Saved View",
        description: `Saved view "${data.name}" updated`,
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to update saved view"
      toast.add({
        type: "error",
        title: "Saved View",
        description: msg,
      })
    },
  })
}

export function useDeleteSavedViewMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSavedView(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedViewKeys.all })
      toast.add({
        type: "success",
        title: "Saved View",
        description: "Saved view deleted",
      })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to delete saved view"
      toast.add({
        type: "error",
        title: "Saved View",
        description: msg,
      })
    },
  })
}

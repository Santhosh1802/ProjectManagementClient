/**
 * Realtime Domain Integration Boundary (V2 Foundation)
 *
 * NOTE: Phase 1 establishes the typed contracts and cache invalidation adapters
 * without opening active WebSocket/STOMP connections. Future real-time event
 * dispatchers will invoke these adapters to keep TanStack Query caches fresh.
 */

import type { QueryClient } from "@tanstack/react-query"
import { taskKeys, projectKeys } from "@/lib/queryKeys"

export type RealtimeEventType =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "PROJECT_CREATED"
  | "PROJECT_MEMBER_ADDED"

export interface RealtimeEnvelope<T = unknown> {
  eventId: string
  eventType: RealtimeEventType
  occurredAt: string
  payload: T
}

export interface TaskStatusChangedPayload {
  taskId: string
  projectId: string
  actorId?: string
  previousStatus: string
  newStatus: string
}

export interface TaskCreatedPayload {
  taskId: string
  projectId: string
  actorId: string
  assignedToId?: string
  title: string
  status: string
  priority: string
}

export interface ProjectMemberAddedPayload {
  membershipId: string
  projectId: string
  userId: string
  role: string
}

/**
 * Handles incoming realtime domain events by selectively invalidating
 * or updating TanStack Query cache entries without hard page reloads.
 */
export function handleRealtimeDomainEvent(
  envelope: RealtimeEnvelope,
  queryClient: QueryClient
): void {
  switch (envelope.eventType) {
    case "TASK_CREATED": {
      const payload = envelope.payload as TaskCreatedPayload
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (payload?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.detail(payload.projectId),
        })
      }
      break
    }

    case "TASK_STATUS_CHANGED":
    case "TASK_UPDATED": {
      const payload = envelope.payload as TaskStatusChangedPayload
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
      if (payload?.taskId) {
        void queryClient.invalidateQueries({
          queryKey: taskKeys.detail(payload.taskId),
        })
      }
      if (payload?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.detail(payload.projectId),
        })
      }
      break
    }

    case "PROJECT_MEMBER_ADDED": {
      const payload = envelope.payload as ProjectMemberAddedPayload
      if (payload?.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.members(payload.projectId),
        })
        void queryClient.invalidateQueries({
          queryKey: projectKeys.detail(payload.projectId),
        })
      }
      break
    }

    case "PROJECT_CREATED": {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all })
      break
    }

    default:
      break
  }
}

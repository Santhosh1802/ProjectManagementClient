import { describe, it, expect, vi } from "vitest"
import type { QueryClient } from "@tanstack/react-query"
import {
  handleRealtimeDomainEvent,
  type RealtimeEnvelope,
  type TaskStatusChangedPayload,
  type TaskCreatedPayload,
} from "./realtimeBoundary"
import { taskKeys, projectKeys } from "@/lib/queryKeys"

describe("handleRealtimeDomainEvent", () => {
  it("should invalidate task list and project detail on TASK_CREATED event", () => {
    const invalidateQueriesMock = vi.fn().mockResolvedValue(undefined)
    const mockQueryClient = {
      invalidateQueries: invalidateQueriesMock,
    } as unknown as QueryClient

    const envelope: RealtimeEnvelope<TaskCreatedPayload> = {
      eventId: "e-1",
      eventType: "TASK_CREATED",
      occurredAt: new Date().toISOString(),
      payload: {
        taskId: "task-1",
        projectId: "proj-100",
        actorId: "user-1",
        title: "Test Task",
        status: "TODO",
        priority: "HIGH",
      },
    }

    handleRealtimeDomainEvent(envelope, mockQueryClient)

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: taskKeys.all })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: projectKeys.detail("proj-100"),
    })
  })

  it("should invalidate specific task detail on TASK_STATUS_CHANGED event", () => {
    const invalidateQueriesMock = vi.fn().mockResolvedValue(undefined)
    const mockQueryClient = {
      invalidateQueries: invalidateQueriesMock,
    } as unknown as QueryClient

    const envelope: RealtimeEnvelope<TaskStatusChangedPayload> = {
      eventId: "e-2",
      eventType: "TASK_STATUS_CHANGED",
      occurredAt: new Date().toISOString(),
      payload: {
        taskId: "task-2",
        projectId: "proj-100",
        previousStatus: "TODO",
        newStatus: "IN_PROGRESS",
      },
    }

    handleRealtimeDomainEvent(envelope, mockQueryClient)

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: taskKeys.all })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: taskKeys.detail("task-2"),
    })
    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: projectKeys.detail("proj-100"),
    })
  })

  it("should safely ignore unknown event types without throwing or invalidating", () => {
    const invalidateQueriesMock = vi.fn().mockResolvedValue(undefined)
    const mockQueryClient = {
      invalidateQueries: invalidateQueriesMock,
    } as unknown as QueryClient

    const unknownEnvelope = {
      eventId: "e-99",
      eventType: "UNKNOWN_FUTURE_EVENT" as unknown as import("./realtimeBoundary").DomainEventType,
      occurredAt: new Date().toISOString(),
      payload: {},
    }


    expect(() => handleRealtimeDomainEvent(unknownEnvelope, mockQueryClient)).not.toThrow()
    expect(invalidateQueriesMock).not.toHaveBeenCalled()
  })
})

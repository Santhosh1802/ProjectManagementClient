export interface ActivityLog {
  id: string;
  taskId: string | null;
  projectId: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actionType: string;
  details: string;
  createdAt: string;
}

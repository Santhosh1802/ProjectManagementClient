import api from '@/lib/api';
import type { ActivityLog } from '../types/activity.types';

export const activityService = {
  getTaskActivity: async (taskId: string): Promise<ActivityLog[]> => {
    const response = await api.get<ActivityLog[]>(`/activity/task/${taskId}`);
    return response.data;
  },

  getProjectActivity: async (projectId: string): Promise<ActivityLog[]> => {
    const response = await api.get<ActivityLog[]>(`/activity/project/${projectId}`);
    return response.data;
  },
};

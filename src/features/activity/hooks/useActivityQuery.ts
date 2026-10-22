import { useQuery } from '@tanstack/react-query';
import { activityKeys } from '@/lib/queryKeys';
import { activityService } from '../services/activity.service';

export const useTaskActivityQuery = (taskId: string | undefined) => {
  return useQuery({
    queryKey: activityKeys.byTask(taskId || ''),
    queryFn: () => activityService.getTaskActivity(taskId!),
    enabled: Boolean(taskId),
  });
};

export const useProjectActivityQuery = (projectId: string | undefined) => {
  return useQuery({
    queryKey: activityKeys.byProject(projectId || ''),
    queryFn: () => activityService.getProjectActivity(projectId!),
    enabled: Boolean(projectId),
  });
};

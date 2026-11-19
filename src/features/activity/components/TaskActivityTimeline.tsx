import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2 } from 'lucide-react';
import DataPagination, { useClientPagination } from '@/components/common/DataPagination';
import { useTaskActivityQuery } from '../hooks/useActivityQuery';

interface TaskActivityTimelineProps {
  taskId: string;
}

export const TaskActivityTimeline: React.FC<TaskActivityTimelineProps> = ({ taskId }) => {
  const { data: activities = [], isLoading, isError } = useTaskActivityQuery(taskId);
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    paginatedItems: paginatedActivities,
  } = useClientPagination(activities, 6);

  return (
    <Card className="rounded-xl border border-border shadow-xs min-w-0">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold">Activity History</CardTitle>
          {activities.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
              {activities.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 min-w-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">Loading activity history...</span>
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive py-2">Failed to load activity history.</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 italic">No recorded activity yet for this task.</p>
        ) : (
          <>
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {paginatedActivities.map((item) => (
                <div key={item.id} className="relative group min-w-0">
                  <div className="absolute -left-[1.65rem] top-1.5 h-2.5 w-2.5 rounded-full bg-primary/70 ring-4 ring-background" />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {item.actorName || 'System'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">
                      {item.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <DataPagination
              compact
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              pageSizeOptions={[6, 12, 24]}
              itemLabel="events"
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

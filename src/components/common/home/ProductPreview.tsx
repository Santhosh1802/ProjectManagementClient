import {
  Check,
  CircleDot,
  Clock3,
  FolderKanban,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const tasks = [
  {
    title: "Design dashboard",
    status: "Completed",
    priority: "High",
    person: "S",
  },
  {
    title: "Implement authentication",
    status: "In Progress",
    priority: "High",
    person: "A",
  },
  {
    title: "Create project settings",
    status: "Todo",
    priority: "Medium",
    person: "P",
  },
];

export default function ProductPreview() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />

          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-2xl">
            {/* Browser header */}
            <div className="flex h-11 items-center border-b bg-muted/30 px-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
                <span className="size-2.5 rounded-full bg-muted-foreground/20" />
              </div>

              <div className="mx-auto hidden h-6 w-64 items-center justify-center rounded-md border bg-background text-[10px] text-muted-foreground sm:flex">
                app.devflow.com/projects
              </div>

              <div className="w-16" />
            </div>

            <div className="grid min-h-112 md:grid-cols-[190px_1fr]">
              {/* Sidebar */}
              <aside className="hidden border-r bg-muted/10 p-4 md:block">
                <div className="mb-7 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <FolderKanban className="size-3.5" />
                  </div>

                  <span className="text-xs font-semibold">
                    DevFlow
                  </span>
                </div>

                <div className="space-y-1">
                  {[
                    {
                      label: "Dashboard",
                      icon: CircleDot,
                      active: false,
                    },
                    {
                      label: "Projects",
                      icon: FolderKanban,
                      active: true,
                    },
                    {
                      label: "Tasks",
                      icon: ListTodo,
                      active: false,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] ${
                          item.active
                            ? "bg-muted font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {item.label}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <p className="mb-2 px-2.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                    Workspace
                  </p>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] text-muted-foreground">
                      <Users className="size-3.5" />
                      Members
                    </div>

                    <div className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[11px] text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      Activity
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main */}
              <div className="min-w-0 p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Workspace
                    </p>

                    <h3 className="mt-1 text-lg font-semibold">
                      Projects
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <div className="hidden h-9 w-36 items-center gap-2 rounded-md border px-3 text-[10px] text-muted-foreground sm:flex">
                      <Search className="size-3.5" />
                      Search projects
                    </div>

                    <div className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-[10px] font-medium text-primary-foreground">
                      <Plus className="size-3.5" />
                      New project
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    ["8", "Projects"],
                    ["24", "My tasks"],
                    ["5", "Due soon"],
                    ["37", "Completed"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-lg border bg-muted/10 p-3"
                    >
                      <p className="text-lg font-semibold">
                        {value}
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Project */}
                <div className="mt-6 rounded-xl border">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold">
                        Website Redesign
                      </p>

                      <p className="mt-0.5 text-[9px] text-muted-foreground">
                        12 tasks · 68% complete
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[9px]"
                      >
                        Active
                      </Badge>

                      <MoreHorizontal className="size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="divide-y">
                    {tasks.map((task) => (
                      <div
                        key={task.title}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                            task.status === "Completed"
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {task.status === "Completed" && (
                            <Check className="size-3" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-[10px] font-medium ${
                              task.status === "Completed"
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        <span className="hidden text-[9px] text-muted-foreground sm:block">
                          {task.priority}
                        </span>

                        <span className="hidden rounded-full border px-2 py-0.5 text-[8px] sm:block">
                          {task.status}
                        </span>

                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[8px] font-medium">
                          {task.person}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
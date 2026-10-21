import {
  Check,
  CircleDot,
  Columns3,
  FolderKanban,
  LayoutGrid,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ProductPreview() {
  return (
    <section className="relative py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* MagicUI Style Outer Glow and Border Beam */}
          <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-70 blur-xl" />

          <Card className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl">
            {/* Browser Header Bar */}
            <div className="flex h-11 items-center justify-between border-b border-border/70 bg-muted/40 px-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/80 px-4 py-1 text-[11px] text-muted-foreground shadow-2xs font-mono">
                <span className="text-primary font-semibold">https://</span>
                <span>devflow.internal/app/projects/e1a-89/tasks</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] border-primary/30 text-primary bg-primary/5">
                  Live V1 Preview
                </Badge>
              </div>
            </div>

            {/* Application Mock Layout */}
            <div className="grid min-h-[500px] md:grid-cols-[210px_1fr]">
              {/* Sidebar Preview */}
              <aside className="hidden border-r border-border/70 bg-sidebar/50 p-4 md:flex md:flex-col justify-between">
                <div className="space-y-6">
                  {/* Logo Brand */}
                  <div className="flex items-center gap-2.5 px-1">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                      <FolderKanban className="size-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold tracking-tight">DevFlow</span>
                      <span className="ml-1.5 rounded bg-primary/10 px-1 py-0.2 text-[9px] font-mono text-primary">v1.0</span>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="space-y-1">
                    <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      Workspace
                    </p>
                    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50">
                      <CircleDot className="size-3.5" />
                      <span>Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg bg-primary text-primary-foreground font-semibold px-2.5 py-1.5 text-xs shadow-xs">
                      <FolderKanban className="size-3.5" />
                      <span>Projects</span>
                      <span className="ml-auto size-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50">
                      <ListTodo className="size-3.5" />
                      <span>Tasks</span>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50">
                      <Users className="size-3.5" />
                      <span>Members</span>
                    </div>
                  </div>
                </div>

                {/* Bottom User Role Badge */}
                <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center font-bold text-[10px] text-primary">
                      PM
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[11px]">Alex Mercer</p>
                      <p className="text-[9px] text-muted-foreground">PROJECT_MANAGER</p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content Dashboard & Kanban Mock */}
              <div className="flex flex-col min-w-0 p-5 sm:p-6 bg-background/50">
                {/* Project Header Bar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold">Cloud Migration Pipeline</h2>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        ACTIVE
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        Due in 14 days
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Role-enforced project tasks • Manager View (All tasks visible)
                    </p>
                  </div>

                  {/* Actions & View Switcher */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/30">
                      <span className="flex items-center gap-1 rounded-md bg-background px-2 py-1 text-[11px] font-medium shadow-2xs">
                        <Columns3 className="size-3 text-primary" />
                        Board
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground">
                        <LayoutGrid className="size-3" />
                        Cards
                      </span>
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      <Plus className="size-3.5" />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* 3 Column Kanban Board Mock */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5 flex-1">
                  {/* Column 1: TODO */}
                  <div className="flex flex-col rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-slate-400" />
                        <span className="text-xs font-semibold">TODO</span>
                        <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground font-mono">1</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-card p-3 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-mono text-amber-500 border-amber-500/30">HIGH</Badge>
                        <span className="text-[10px] text-muted-foreground">Oct 26</span>
                      </div>
                      <p className="text-xs font-medium">Configure Postgres Connection Pooling</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span>Assigned: David K.</span>
                        <span className="size-4 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[8px] text-primary">DK</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: IN PROGRESS */}
                  <div className="flex flex-col rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-semibold">IN PROGRESS</span>
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary font-mono font-semibold">1</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-primary/40 bg-card p-3 shadow-xs ring-1 ring-primary/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-mono text-rose-500 border-rose-500/30">CRITICAL</Badge>
                        <span className="text-[10px] text-primary font-medium">Tomorrow</span>
                      </div>
                      <p className="text-xs font-medium">Implement JWT Role-Based Authorization Guard</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span className="text-foreground/80 font-medium">Assigned: Alex M.</span>
                        <span className="size-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[8px]">AM</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: DONE */}
                  <div className="flex flex-col rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold">DONE</span>
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] text-emerald-600 font-mono font-semibold">1</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-card/60 p-3 shadow-2xs space-y-2 opacity-85">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[9px] font-mono text-emerald-600 border-emerald-500/30">MEDIUM</Badge>
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <Check className="size-3" /> Completed
                        </span>
                      </div>
                      <p className="text-xs font-medium line-through text-muted-foreground">Database Schema & Liquibase Migrations</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                        <span>Assigned: Alex M.</span>
                        <span className="size-4 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-[8px]">AM</span>
                      </div>
                    </div>
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
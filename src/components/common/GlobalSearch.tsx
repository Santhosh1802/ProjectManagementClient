import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderDot, CheckSquare, MessageSquare, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";

import { globalSearch } from "@/features/search/services/search.service";
import type {
  GlobalSearchProjectItem,
  GlobalSearchTaskItem,
  GlobalSearchMemberItem,
  GlobalSearchCommentItem,
} from "@/features/search/types/search.types";

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export default function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<GlobalSearchProjectItem[]>([]);
  const [tasks, setTasks] = useState<GlobalSearchTaskItem[]>([]);
  const [members, setMembers] = useState<GlobalSearchMemberItem[]>([]);
  const [comments, setComments] = useState<GlobalSearchCommentItem[]>([]);

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setTimeout(() => {
        setQuery("");
        setProjects([]);
        setTasks([]);
        setMembers([]);
        setComments([]);
      }, 200);
    }
    onOpenChange(val);
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setProjects([]);
      setTasks([]);
      setMembers([]);
      setComments([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await globalSearch(query.trim(), 5);
        setProjects(res.projects || []);
        setTasks(res.tasks || []);
        setMembers(res.members || []);
        setComments(res.comments || []);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const hasAnyResults =
    projects.length > 0 || tasks.length > 0 || members.length > 0 || comments.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <Command shouldFilter={false} className="border-none">
        <CommandInput
          placeholder="Search projects, tasks, team members, comments..."
          value={query}
          onValueChange={(val) => {
            setQuery(val);
            if (val.trim().length < 2) {
              setProjects([]);
              setTasks([]);
              setMembers([]);
              setComments([]);
            }
          }}
        />
        <CommandList>
          {loading && (
            <div className="p-8 flex flex-col items-center justify-center text-sm text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
              <span>Searching across workspace...</span>
            </div>
          )}

          {!loading && query.trim().length >= 2 && !hasAnyResults && (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              No results found for "{query}".
            </CommandEmpty>
          )}

          {!loading && query.trim().length < 2 && (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search across projects, tasks, team, and comments.
            </CommandEmpty>
          )}

          {/* Projects Group */}
          {!loading && projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map((p) => (
                <CommandItem
                  key={p.id}
                  onSelect={() => handleSelect(`/app/projects/${p.id}`)}
                  className="flex items-center justify-between gap-3 py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <FolderDot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {p.ownerName ? `Owner: ${p.ownerName}` : "Project"}
                      </span>
                    </div>
                  </div>
                  {p.status && (
                    <Badge variant="secondary" className="text-[10px] font-medium uppercase shrink-0">
                      {p.status}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Tasks Group */}
          {!loading && tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.map((t) => (
                <CommandItem
                  key={t.id}
                  onSelect={() => handleSelect(`/app/tasks/${t.id}`)}
                  className="flex items-center justify-between gap-3 py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[320px]">
                      <span className="font-medium text-sm truncate">{t.title}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {t.projectName || "Task"}
                        {t.assignedToName ? ` • ${t.assignedToName}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.priority && (
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {t.priority}
                      </Badge>
                    )}
                    {t.status && (
                      <Badge variant="secondary" className="text-[10px] font-medium uppercase">
                        {t.status}
                      </Badge>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Team Members Group */}
          {!loading && members.length > 0 && (
            <CommandGroup heading="Team Members">
              {members.map((u) => (
                <CommandItem
                  key={u.id}
                  onSelect={() => handleSelect(`/app/users/${u.id}`)}
                  className="flex items-center justify-between gap-3 py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {u.firstName?.[0]}
                        {u.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                    </div>
                  </div>
                  {u.role && (
                    <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                      {u.role}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Comments Group */}
          {!loading && comments.length > 0 && (
            <CommandGroup heading="Comments">
              {comments.map((c) => (
                <CommandItem
                  key={c.id}
                  onSelect={() =>
                    c.taskId ? handleSelect(`/app/tasks/${c.taskId}`) : undefined
                  }
                  className="flex items-center justify-between gap-3 py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 max-w-[240px] sm:max-w-[360px]">
                      <span className="font-medium text-xs text-foreground truncate">
                        "{c.contentSnippet}"
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">
                        By {c.authorName} on {c.taskTitle || "Task"}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span className="hidden sm:inline">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span className="hidden sm:inline">Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd>
            <span>Close</span>
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FolderDot, CheckSquare, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";

import { useAppSelector } from "@/hooks/redux-hooks";
import { searchUsers } from "@/features/users/services/users.service";
import { searchProjects } from "@/features/projects/services/projects.services";
import { getAllTasks, getTasksByAssignedTo } from "@/features/tasks/services/task.services";

import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import type { User } from "@/features/users/types/user.types";
import type { Project } from "@/features/projects/types/project.types";
import type { Task } from "@/features/tasks/types/task.types";

export default function GlobalSearch({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setTimeout(() => {
        setQuery("");
        setUsers([]);
        setProjects([]);
        setTasks([]);
      }, 200);
    }
    onOpenChange(val);
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      
      try {
        // According to instructions, use existing endpoints and respect roles
        const canSearchUsers = currentUser?.user_role === "ADMIN" || currentUser?.user_role === "MANAGER";
        
        const [usersRes, projectsRes, tasksRes] = await Promise.allSettled([
          canSearchUsers
            ? searchUsers({ keyword: query, size: 5 })
            : Promise.resolve({ content: [] }),
            
          searchProjects({ keyword: query, size: 5 }),
          
          currentUser?.user_role === "ADMIN" 
            ? getAllTasks({ size: 100 }) 
            : getTasksByAssignedTo({ assignedToId: currentUser?.id || "", size: 100 })
        ]);

        if (usersRes.status === "fulfilled" && usersRes.value) {
          setUsers(usersRes.value.content || []);
        }
        
        if (projectsRes.status === "fulfilled" && projectsRes.value) {
          setProjects(projectsRes.value.content || []);
        }
        
        if (tasksRes.status === "fulfilled" && tasksRes.value) {
          const allTasks = tasksRes.value.content || [];
          const filtered = allTasks.filter(t => 
            t.title.toLowerCase().includes(query.toLowerCase()) || 
            (t.description && t.description.toLowerCase().includes(query.toLowerCase()))
          );
          setTasks(filtered.slice(0, 5));
        }

      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentUser]);

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <Command shouldFilter={false} className="border-none">
        <CommandInput 
          placeholder="Search users, projects, and tasks..." 
          value={query} 
          onValueChange={(val) => {
            setQuery(val);
            if (val.trim().length < 2) {
              setUsers([]);
              setProjects([]);
              setTasks([]);
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
          
          {!loading && query.trim().length >= 2 && users.length === 0 && projects.length === 0 && tasks.length === 0 && (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              No results found for "{query}".
            </CommandEmpty>
          )}
          
          {!loading && query.trim().length < 2 && (
            <CommandEmpty className="py-12 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </CommandEmpty>
          )}

          {!loading && users.length > 0 && (
            <CommandGroup heading="Users">
              {users.map(u => (
                <CommandItem key={u.id} onSelect={() => handleSelect(`/app/users/${u.id}`)} className="flex items-center gap-3 py-2 cursor-pointer">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!loading && projects.length > 0 && (
            <CommandGroup heading="Projects">
              {projects.map(p => (
                <CommandItem key={p.id} onSelect={() => handleSelect(`/app/projects/${p.id}`)} className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <FolderDot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground truncate">Project</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-medium uppercase shrink-0">
                    {p.projectStatus}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!loading && tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.map(t => (
                <CommandItem key={t.id} onSelect={() => handleSelect(`/app/tasks/${t.id}`)} className="flex items-center justify-between gap-3 py-2 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[300px]">
                      <span className="font-medium text-sm truncate">{t.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{t.project?.name || "No project context"}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium uppercase shrink-0">
                    {t.taskStatus}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Kbd className="h-4 min-w-4 px-1 text-[9px]">↑</Kbd>
              <Kbd className="h-4 min-w-4 px-1 text-[9px]">↓</Kbd>
              <span className="hidden sm:inline">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="h-4 min-w-4 px-1 text-[9px]">↵</Kbd>
              <span className="hidden sm:inline">Select</span>
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Kbd className="h-4 min-w-4 px-1 text-[9px]">Esc</Kbd>
            <span>Close</span>
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}

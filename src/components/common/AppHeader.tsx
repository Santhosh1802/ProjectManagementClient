import { Search, Keyboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { getShortcut } from "@/config/keyboardShortcuts";
import { useKeyboardShortcutsUI } from "@/context/KeyboardShortcutsContext";
import { toAriaKeyShortcuts } from "@/lib/keyboard";

import { useAppSelector } from "@/hooks/redux-hooks";
import AppBreadcrumb from "./AppBreadcrumb";
import ShortcutHint from "./ShortcutHint";
import ThemeColorSelector from "./ThemeColorSelector";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";


const searchShortcut = getShortcut("global.search");
const helpShortcut = getShortcut("global.shortcuts");

export default function AppHeader() {
  const currentUser = useAppSelector((state) => state.auth.user);
  // Ctrl/Cmd + K is handled by the central keyboard shortcut system.
  const { openSearch, openShortcuts } = useKeyboardShortcutsUI();

  const searchKeys = searchShortcut?.keys ?? ["mod", "k"];
  const ariaKeyShortcuts = toAriaKeyShortcuts(searchKeys);
  
  const helpKeys = helpShortcut?.keys ?? ["mod", "/"];
  const helpAriaKeyShortcuts = toAriaKeyShortcuts(helpKeys);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:bg-gradient-to-r after:from-transparent after:via-primary/35 after:to-transparent">

      <div className="flex w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4">

        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1 shrink-0" />

        <Separator
          orientation="vertical"
          className="h-4 shrink-0"
        />

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <AppBreadcrumb />
        </div>


        {/* Right Section */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Global Search */}
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search users, projects and tasks"
            aria-keyshortcuts={ariaKeyShortcuts}
            aria-haspopup="dialog"
            className="
              hidden
              h-8
              w-64
              items-center
              gap-2
              rounded-md
              border
              border-border/60
              bg-muted/40
              px-3
              text-sm
              text-muted-foreground
              transition-all
              outline-none
              hover:border-primary/40
              hover:bg-muted/70
              focus-visible:border-primary
              focus-visible:ring-2
              focus-visible:ring-primary/25
              md:flex
            "
          >
            <Search className="size-4 text-primary/70 transition-colors" aria-hidden="true" />

            <span className="flex-1 text-left text-xs">
              Search...
            </span>

            <ShortcutHint keys={searchKeys} keyClassName="bg-background/80 border-border/80" />
          </button>


          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-keyshortcuts={ariaKeyShortcuts}
            aria-haspopup="dialog"
            className="size-8 text-muted-foreground hover:text-primary md:hidden"
          >
            <Search className="size-4" />

            <span className="sr-only">
              Search
            </span>
          </Button>

          {/* Keyboard Shortcuts Help */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openShortcuts}
            aria-keyshortcuts={helpAriaKeyShortcuts}
            aria-label="Keyboard shortcuts"
            className="size-8 text-muted-foreground hover:text-primary hidden sm:flex"
            title="Keyboard shortcuts"
          >
            <Keyboard className="size-4" />
          </Button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Theme & Color Selector */}
          <ThemeColorSelector />


          {/* User Avatar with subtle theme border */}
          <Avatar className="size-8 ring-1 ring-primary/25 transition-all hover:ring-primary/60">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {currentUser
                ? `${currentUser.firstName?.[0] || ""}${currentUser.lastName?.[0] || ""}`.toUpperCase() || "U"
                : "U"}
            </AvatarFallback>
          </Avatar>
        </div>

      </div>

    </header>
  );
}
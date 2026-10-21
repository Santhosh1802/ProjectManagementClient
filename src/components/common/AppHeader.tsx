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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b backdrop-blur">

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
              bg-muted/40
              px-3
              text-sm
              text-muted-foreground
              transition-colors
              outline-none
              hover:bg-muted
              focus-visible:border-ring
              focus-visible:ring-2
              focus-visible:ring-ring/50
              md:flex
            "
          >
            <Search className="size-4" aria-hidden="true" />

            <span className="flex-1 text-left">
              Search...
            </span>

            <ShortcutHint keys={searchKeys} keyClassName="bg-background" />
          </button>


          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openSearch}
            aria-keyshortcuts={ariaKeyShortcuts}
            aria-haspopup="dialog"
            className="size-8 md:hidden"
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
            className="size-8 text-muted-foreground hover:text-foreground hidden sm:flex"
            title="Keyboard shortcuts"
          >
            <Keyboard className="size-4" />
          </Button>

          {/* User */}
          <Avatar className="size-8">
            <AvatarFallback>
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
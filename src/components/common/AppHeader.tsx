import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import  AppBreadcrumb  from "./AppBreadcrumb";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b backdrop-blur">

      <div className="flex w-full items-center gap-3 px-4">

        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1" />

        <Separator
          orientation="vertical"
          className="h-4"
        />

        {/* Breadcrumb */}
        <AppBreadcrumb />


        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2">

          {/* Global Search */}
          <button
            type="button"
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
              hover:bg-muted
              md:flex
            "
          >
            <Search className="size-4" />

            <span className="flex-1 text-left">
              Search...
            </span>

            <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>


          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:hidden"
          >
            <Search className="size-4" />

            <span className="sr-only">
              Search
            </span>
          </Button>


          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
          >
            <Bell className="size-4" />

            <span className="sr-only">
              Notifications
            </span>
          </Button>


          {/* User */}
          <Avatar className="size-8">

            <AvatarFallback>
              SK
            </AvatarFallback>

          </Avatar>

        </div>

      </div>

    </header>
  );
}

"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import type { UserView } from "../types/user.types";

interface UserViewSwitcherProps {
  value: UserView;
  onChange: (value: UserView) => void;
}

const isUserView = (value: string): value is UserView =>
  value === "card" || value === "list" || value === "table";

export default function UserViewSwitcher({
  value,
  onChange,
}: UserViewSwitcherProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next: string[]) => {
        const selected = next.find(isUserView);

        if (selected) {
          onChange(selected);
        }
      }}
      variant="outline"
      size="sm"
      aria-label="User display mode"
    >
      <ToggleGroupItem value="card" aria-label="Card view">
        <LayoutGrid className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="list" aria-label="List view">
        <List className="size-4" />
      </ToggleGroupItem>

      <ToggleGroupItem value="table" aria-label="Table view">
        <Table2 className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

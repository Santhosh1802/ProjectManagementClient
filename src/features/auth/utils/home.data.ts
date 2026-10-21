import {
  Columns3,
  FolderKanban,
  Keyboard,
  Palette,
  ShieldCheck,
  Users,
} from "lucide-react";

export const features = [
  {
    icon: FolderKanban,
    title: "Project Lifecycle & Ownership",
    tag: "Core",
    description:
      "Manage projects from inception to completion with start dates, due dates, owner privileges, and status controls.",
  },
  {
    icon: Columns3,
    title: "Kanban & Interactive Card Views",
    tag: "Productivity",
    description:
      "Visualize tasks across TODO, IN_PROGRESS, and DONE stages with instant drag-style status updates and celebration confetti.",
  },
  {
    icon: ShieldCheck,
    title: "Granular RBAC & Role Guards",
    tag: "Security",
    description:
      "Enforce multi-tiered roles across Global (ADMIN, USER) and Project levels (OWNER, MANAGER, MEMBER) with route protection.",
  },
  {
    icon: Users,
    title: "Scoped Member Visibility",
    tag: "Access Control",
    description:
      "Members view only their assigned tasks, while Project Managers and Owners access the complete project roadmap.",
  },
  {
    icon: Palette,
    title: "5 VS Code Developer Themes",
    tag: "Appearance",
    description:
      "Switch on the fly between Indigo, Oceanic Slate, Emerald Forest, Cyber Rose, and Monochrome Zinc in Light or Dark modes.",
  },
  {
    icon: Keyboard,
    title: "Power-User Shortcuts & Search",
    tag: "Speed",
    description:
      "Navigate rapidly with Ctrl/Cmd + K global search, modal dialogs, and instant D theme toggling anywhere in the application.",
  },
];

export const workflowSteps = [
  {
    number: "01",
    title: "Create Project & Assign Members",
    description:
      "Initiate a project workspace, set timelines, and invite team members with MANAGER or MEMBER roles.",
  },
  {
    number: "02",
    title: "Structure Tasks & Set Priorities",
    description:
      "Create tasks with LOW, MEDIUM, HIGH, or CRITICAL priority and assign them to specific team members.",
  },
  {
    number: "03",
    title: "Manage Progress in Real Time",
    description:
      "Members work on their assigned tasks while managers track the full delivery pipeline across Kanban boards.",
  },
];

export const productPrinciples = [
  "Clear Role-Based Access Control (Admin, Manager, Member)",
  "Member task isolation with manager oversight",
  "React Query cache invalidation for instant data freshness",
  "Tailwind & shadcn/ui design tokens with 5 color themes",
  "Desktop keyboard shortcuts and command search",
];
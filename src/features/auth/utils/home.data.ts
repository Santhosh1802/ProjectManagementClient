import {
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";

export const features = [
  {
    icon: FolderKanban,
    title: "Projects",
    description:
      "Keep every project organized with clear ownership, timelines, status, and team members.",
  },
  {
    icon: ListTodo,
    title: "Tasks",
    description:
      "Break projects into manageable tasks, assign work, set priorities, and track progress.",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description:
      "Bring your team together around the same projects and give everyone clear responsibilities.",
  },
];

export const workflowSteps = [
  {
    number: "01",
    title: "Create your project",
    description:
      "Define your project, timeline, owner, and the people working on it.",
  },
  {
    number: "02",
    title: "Break work into tasks",
    description:
      "Turn the project into actionable tasks with priorities, assignees, and deadlines.",
  },
  {
    number: "03",
    title: "Move work forward",
    description:
      "Track progress, update task status, and keep your team aligned until the work is done.",
  },
];

export const productPrinciples = [
  "Keep projects organized",
  "Give every task an owner",
  "Track work from start to finish",
  "Keep the whole team aligned",
];
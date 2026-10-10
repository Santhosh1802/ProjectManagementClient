import type { User } from "../types/user.types";

export function getUserName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ");
}

export function getUserInitials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ""}`
    .toUpperCase()
    .slice(0, 2);
}

export function formatUserDate(value: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}
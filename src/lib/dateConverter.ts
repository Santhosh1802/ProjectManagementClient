export function formatDateTime(isoString?: string | null) {
  if (!isoString) {
    return "—";
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: true,
  }).format(date);
}
import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FolderKanban className="size-3.5" />
          </div>

          <div>
            <span className="text-sm font-semibold">
              DevFlow
            </span>

            <p className="text-[10px] text-muted-foreground">
              Simple project management for modern teams.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DevFlow
        </p>

        <div className="flex gap-5 text-xs text-muted-foreground">
          <Link
            to="/privacy"
            className="transition-colors hover:text-foreground"
          >
            Privacy
          </Link>

          <Link
            to="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
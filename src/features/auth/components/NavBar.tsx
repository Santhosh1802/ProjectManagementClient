import LogoWithVersion from "@/components/common/LogoWithVersion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <LogoWithVersion />

        <div className="hidden items-center gap-6 md:flex">
          <a
            href="/#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>

          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </a>

          <Link
            to="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>

          <Button size="sm">
            <Link to="/register">
              Get started
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            
            variant="ghost"
            size="sm"
          >
            <Link to="/login">
              Sign in
            </Link>
          </Button>

          <Button
            
            size="sm"
          >
            <Link to="/register">
              Start
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
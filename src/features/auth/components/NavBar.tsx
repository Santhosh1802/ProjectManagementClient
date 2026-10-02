import LogoWithVersion from "@/components/common/LogoWithVersion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="w-full border-b bg-accent-foreground">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <LogoWithVersion />

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate("/login")}
          >
            Sign in
          </Button>

          <Button
            variant="default"
            size="sm"
            type="button"
            onClick={() => navigate("/register")}
          >
            <span className="hidden sm:inline">
              Get Started
            </span>

            <span className="sm:hidden">
              Start
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
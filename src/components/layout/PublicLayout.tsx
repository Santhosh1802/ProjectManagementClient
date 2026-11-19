import NavBar from "@/features/auth/components/NavBar";
import ServerStatus from "@/components/common/ServerStatus";
import { AccessibilityToolbar } from "@/components/common/AccessibilityToolbar";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux-hooks";

export default function PublicLayout() {
  const serverAvailable = useAppSelector(
    (state) => state.app.isBackendAvailable
  );

  return (
    <div className="min-h-screen w-full">
      <header className="fixed inset-x-0 top-0 z-50">
        {!serverAvailable && <ServerStatus />}
        <AccessibilityToolbar />
        <NavBar />
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className={
          serverAvailable
            ? "min-h-screen bg-gradient-to-br from-background via-background to-secondary/15 pt-28 outline-none"
            : "min-h-screen bg-gradient-to-br from-background via-background to-secondary/15 pt-38 outline-none"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}

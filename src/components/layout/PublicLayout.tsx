import NavBar from "@/features/auth/components/NavBar";
import ServerStatus from "@/components/common/ServerStatus";
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

        <NavBar />
      </header>

      <main
        className={
          serverAvailable
            ? "pt-16"
            : "pt-26"
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
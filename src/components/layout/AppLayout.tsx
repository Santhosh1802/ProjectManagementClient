import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import { useAppSelector } from "@/hooks/redux-hooks";

import AppSidebar from "../common/AppSidebar";
import AppHeader from "../common/AppHeader";
import type { RootState } from "@/app/store";

export default function AppLayout() {
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading,
  } = useAppSelector(
    (state:RootState) => state.auth
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppHeader />

        <main className="flex flex-1 flex-col">
          <div className="flex-1 p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
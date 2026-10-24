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
import KeyboardShortcutsProvider from "../common/KeyboardShortcutsProvider";
import MobileQuickActionFAB from "../common/MobileQuickActionFAB";
import AppLoader from "@/components/common/AppLoader";
import type { RootState } from "@/app/store";
import { useRealtimeNotifications } from "@/features/notifications/hooks/useRealtimeNotifications";


export default function AppLayout() {
  const location = useLocation();

  const {
    isAuthenticated,
    isLoading,
  } = useAppSelector(
    (state:RootState) => state.auth
  );

  useRealtimeNotifications({ isAuthenticated });


  if (isLoading) {
    return <AppLoader message="Verifying session..." fullScreen />;
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
      <KeyboardShortcutsProvider>
        <AppSidebar />

        <SidebarInset>
          <AppHeader />

          <main className="flex flex-1 flex-col">
            <div className="flex-1 p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>

        <MobileQuickActionFAB />
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  );
}
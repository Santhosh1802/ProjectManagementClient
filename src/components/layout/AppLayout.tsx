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
import { AccessibilityToolbar } from "../common/AccessibilityToolbar";
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

        <SidebarInset className="min-w-0 overflow-x-hidden">
          <AccessibilityToolbar />
          <AppHeader />

          <div
            id="main-content"
            tabIndex={-1}
            className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-gradient-to-br from-background via-background to-secondary/15 outline-none"
          >
            <div className="mx-auto min-w-0 w-full max-w-[1440px] flex-1 p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </div>
        </SidebarInset>

        <MobileQuickActionFAB />
      </KeyboardShortcutsProvider>
    </SidebarProvider>
  );
}

import { useEffect, useState } from "react";

import UserDetails from "@/features/users/components/UserDetails";
import DangerZone from "@/features/users/components/DangerZone";
import AccountSettings from "@/features/users/components/AccountSettings";
import UserWorkspaceOverview from "@/features/users/components/UserWorkspaceOverview";
import { getUserById } from "@/features/users/services/users.service";

import PageContainer from "@/components/common/PageContainer";
import PageHeader from "@/components/common/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FolderKanban, Settings } from "lucide-react";

import {
  setUser,
  setUserError,
  setUserLoading,
} from "@/features/users/slice/user.slice";

import {
  useAppDispatch,
  useAppSelector,
} from "@/hooks/redux-hooks";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const userId = useAppSelector(
    (state) => state.auth.user?.id
  );

  const user = useAppSelector(
    (state) => state.user.user
  );

  const loading = useAppSelector(
    (state) => state.user.loading
  );

  const error = useAppSelector(
    (state) => state.user.error
  );

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (user?.id === userId) {
      return;
    }

    async function fetchUser() {
      try {
        dispatch(setUserLoading(true));

        const response = await getUserById({
          id: userId || "",
        });

        const userData = response;

        dispatch(setUser(userData));
      } catch (error) {
        console.error(
          "Failed to fetch user:",
          error
        );

        dispatch(
          setUserError(
            "Unable to load user profile."
          )
        );
      }
    }

    fetchUser();
  }, [userId, user?.id, dispatch]);

  /* --------------------------------------------- */
  /* No authenticated user */
  /* --------------------------------------------- */

  if (!userId) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Unable to identify the current user.
        </p>
      </div>
    );
  }

  /* --------------------------------------------- */
  /* Loading */
  /* --------------------------------------------- */

  if (loading && !user) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  /* --------------------------------------------- */
  /* Error */
  /* --------------------------------------------- */

  if (error && !user) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PageContainer className="gap-6">
      <PageHeader 
        title="Your Profile" 
        description="View your workspace activity, projects, and manage account settings."
      />

      {/* ----------------------------------------- */}
      {/* User Details Banner */}
      {/* ----------------------------------------- */}

      <UserDetails user={user} />

      {/* ----------------------------------------- */}
      {/* Tabs: Overview & Projects vs Settings */}
      {/* ----------------------------------------- */}

      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setActiveTab(val);
        }}
        className="w-full space-y-6"
      >
        <div className="w-full overflow-x-auto no-scrollbar border-b border-border pb-1">
          <TabsList variant="line" className="inline-flex w-max min-w-full sm:min-w-0 sm:w-auto gap-2">
            <TabsTrigger
              value="overview"
              className="gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <FolderKanban className="size-4 shrink-0" />
              <span>Overview & Projects</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
            >
              <Settings className="size-4 shrink-0" />
              <span>Account Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview & Projects */}
        <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
          <UserWorkspaceOverview
            user={user}
            onSwitchToSettings={() => setActiveTab("settings")}
          />
        </TabsContent>

        {/* Tab 2: Account Settings */}
        <TabsContent value="settings" className="mt-0 space-y-6 focus-visible:outline-none">
          <AccountSettings user={user} />

          {/* Danger Zone */}
          <div className="w-full">
            <DangerZone />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

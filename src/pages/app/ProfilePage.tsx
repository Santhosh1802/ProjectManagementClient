import { useEffect } from "react";

import PersonalInfo from "@/features/users/components/PersonalInfo";
import UserDetails from "@/features/users/components/UserDetails";

import { getUserById } from "@/features/users/services/users.service";

import {
  setUser,
  setUserError,
  setUserLoading,
} from "@/features/users/slice/user.slice";

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import type { RootState } from "@/app/store";

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  /*
   * Auth should provide the ID of the currently
   * authenticated user.
   */
  const userId = useAppSelector(
    (state:RootState) => state.auth.user?.id
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

        const userData = response.data.data;

        dispatch(setUser(userData));
      } catch (error) {
        console.error("Failed to fetch user:", error);

        dispatch(
          setUserError(
            "Unable to load user profile."
          )
        );
      }
    }

    fetchUser();
  }, [userId, user?.id, dispatch]);

  if (!userId) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Unable to identify the current user.
        </p>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

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
    <div className="flex flex-col gap-4">
      <UserDetails user={user} />

      <PersonalInfo user={user} />
    </div>
  );
}
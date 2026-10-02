
import { useEffect } from "react";

import PersonalInfo from "@/features/users/components/PersonalInfo";
import PasswordChanger from "@/features/users/components/PasswordChanger";
import UserDetails from "@/features/users/components/UserDetails";
import DangerZone from "@/features/users/components/DangerZone";

import { getUserById } from "@/features/users/services/users.service";

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
          id: userId || "",//TODO make loader
        });

        const userData = response.data.data;

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
    <div className="flex w-full flex-col gap-5">

      {/* ----------------------------------------- */}
      {/* User Details */}
      {/* ----------------------------------------- */}

      <UserDetails user={user} />

      {/* ----------------------------------------- */}
      {/* Profile Settings */}
      {/* ----------------------------------------- */}

      <div
        className="
          grid
          w-full
          grid-cols-1
          items-start
          gap-5
          xl:grid-cols-2
        "
      >
        {/* Personal Information */}

        <div className="min-w-0">
          <PersonalInfo user={user} />
        </div>

        {/* Password */}

        <div className="min-w-0">
          <PasswordChanger />
        </div>
      </div>

      {/* ----------------------------------------- */}
      {/* Danger Zone */}
      {/* ----------------------------------------- */}

      <div className="w-full">
        <DangerZone />
      </div>
    </div>
  );
}

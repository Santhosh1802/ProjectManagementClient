import * as React from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { setTheme, type Theme } from "@/app/slice/themeSlice";

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

type ThemeProviderProps = {
  children: React.ReactNode;
};

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches
    ? "dark"
    : "light";
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style");

  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  );

  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return !!target.closest(
    "input, textarea, select, [contenteditable='true']"
  );
}

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const dispatch = useAppDispatch();

  const theme = useAppSelector(
    (state) => state.theme.theme
  );

  const applyTheme = React.useCallback(
    (currentTheme: Theme) => {
      const root = document.documentElement;

      const resolvedTheme =
        currentTheme === "system"
          ? getSystemTheme()
          : currentTheme;

      const restoreTransitions =
        disableTransitionsTemporarily();

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);

      restoreTransitions();
    },
    []
  );

  React.useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      COLOR_SCHEME_QUERY
    );

    const handleChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, [theme, applyTheme]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key.toLowerCase() !== "d") {
        return;
      }

      const nextTheme: Theme =
        theme === "dark"
          ? "light"
          : theme === "light"
            ? "dark"
            : getSystemTheme() === "dark"
              ? "light"
              : "dark";

      dispatch(setTheme(nextTheme));
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [theme, dispatch]);

  return <>{children}</>;
}
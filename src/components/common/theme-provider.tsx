import * as React from "react";

import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { setTheme, type Theme } from "@/app/slice/themeSlice";
import { THEME_COLORS, type ThemeColorKey } from "@/config/themeColors";
import { isEditableTarget, isOverlayOpen } from "@/lib/keyboard";

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

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const dispatch = useAppDispatch();

  const theme = useAppSelector(
    (state) => state.theme.theme
  );
  const colorTheme = useAppSelector(
    (state) => state.theme.colorTheme || "indigo"
  );
  const primaryColor = useAppSelector(
    (state) => state.theme.primaryColor || "indigo"
  );
  const secondaryColor = useAppSelector(
    (state) => state.theme.secondaryColor || "teal"
  );

  const applyTheme = React.useCallback(
    (
      currentTheme: Theme,
      currentColorTheme: string,
      currentPrimary: ThemeColorKey,
      currentSecondary: ThemeColorKey
    ) => {
      const root = document.documentElement;

      const resolvedTheme =
        currentTheme === "system"
          ? getSystemTheme()
          : currentTheme;

      const restoreTransitions =
        disableTransitionsTemporarily();

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.setAttribute("data-mode", resolvedTheme);
      root.setAttribute("data-theme", currentColorTheme);

      const primaryDef = THEME_COLORS[currentPrimary] ?? THEME_COLORS.indigo;
      const secondaryDef = THEME_COLORS[currentSecondary] ?? THEME_COLORS.teal;
      const pTokens = resolvedTheme === "dark" ? primaryDef.dark : primaryDef.light;
      const sTokens = resolvedTheme === "dark" ? secondaryDef.dark : secondaryDef.light;

      root.style.setProperty("--primary", pTokens.primary);
      root.style.setProperty("--primary-foreground", pTokens.primaryForeground);
      root.style.setProperty("--ring", pTokens.ring);
      root.style.setProperty("--sidebar-primary", pTokens.primary);
      root.style.setProperty("--sidebar-primary-foreground", pTokens.primaryForeground);
      root.style.setProperty("--sidebar-accent", sTokens.secondary);
      root.style.setProperty("--sidebar-accent-foreground", sTokens.secondaryForeground);
      root.style.setProperty("--sidebar-ring", pTokens.ring);

      root.style.setProperty("--secondary", sTokens.secondary);
      root.style.setProperty("--secondary-foreground", sTokens.secondaryForeground);
      root.style.setProperty("--accent", sTokens.secondary);
      root.style.setProperty("--accent-foreground", sTokens.secondaryForeground);
      root.style.setProperty("--chart-2", sTokens.gradientStop);

      restoreTransitions();
    },
    []
  );

  React.useEffect(() => {
    applyTheme(theme, colorTheme, primaryColor, secondaryColor);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      COLOR_SCHEME_QUERY
    );

    const handleChange = () => {
      applyTheme("system", colorTheme, primaryColor, secondaryColor);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme, colorTheme, primaryColor, secondaryColor, applyTheme]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      // Already handled elsewhere (e.g. "D" completing the G → D shortcut).
      if (event.defaultPrevented) return;

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return;
      }

      if (isEditableTarget(event.target) || isOverlayOpen()) {
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
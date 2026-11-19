export type ThemeColorKey =
  | "indigo"
  | "teal"
  | "blue"
  | "emerald"
  | "rose"
  | "amber"
  | "violet"
  | "slate"

export interface ThemeColorDefinition {
  key: ThemeColorKey
  label: string
  swatchClass: string
  light: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    gradientStop: string
    ring: string
  }
  dark: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    gradientStop: string
    ring: string
  }
}

export const THEME_COLORS: Record<ThemeColorKey, ThemeColorDefinition> = {
  indigo: {
    key: "indigo",
    label: "Indigo",
    swatchClass: "bg-indigo-600",
    light: {
      primary: "oklch(0.49 0.21 272)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.90 0.06 272)",
      secondaryForeground: "oklch(0.24 0.10 272)",
      gradientStop: "oklch(0.49 0.21 272)",
      ring: "oklch(0.52 0.20 272)",
    },
    dark: {
      primary: "oklch(0.57 0.21 272)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.32 0.09 272)",
      secondaryForeground: "oklch(0.98 0.01 272)",
      gradientStop: "oklch(0.55 0.20 272)",
      ring: "oklch(0.62 0.20 272)",
    },
  },
  teal: {
    key: "teal",
    label: "Teal",
    swatchClass: "bg-teal-500",
    light: {
      primary: "oklch(0.49 0.15 186)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.89 0.08 186)",
      secondaryForeground: "oklch(0.20 0.09 190)",
      gradientStop: "oklch(0.50 0.16 186)",
      ring: "oklch(0.52 0.15 186)",
    },
    dark: {
      primary: "oklch(0.54 0.15 186)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.34 0.09 188)",
      secondaryForeground: "oklch(0.98 0.01 186)",
      gradientStop: "oklch(0.52 0.16 186)",
      ring: "oklch(0.58 0.15 186)",
    },
  },
  blue: {
    key: "blue",
    label: "Blue",
    swatchClass: "bg-blue-600",
    light: {
      primary: "oklch(0.50 0.20 250)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.90 0.07 250)",
      secondaryForeground: "oklch(0.22 0.10 250)",
      gradientStop: "oklch(0.50 0.20 250)",
      ring: "oklch(0.54 0.19 250)",
    },
    dark: {
      primary: "oklch(0.56 0.20 250)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.33 0.09 250)",
      secondaryForeground: "oklch(0.98 0.01 250)",
      gradientStop: "oklch(0.54 0.19 250)",
      ring: "oklch(0.60 0.19 250)",
    },
  },
  emerald: {
    key: "emerald",
    label: "Emerald",
    swatchClass: "bg-emerald-600",
    light: {
      primary: "oklch(0.48 0.15 158)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.90 0.07 158)",
      secondaryForeground: "oklch(0.22 0.08 158)",
      gradientStop: "oklch(0.49 0.15 158)",
      ring: "oklch(0.52 0.15 158)",
    },
    dark: {
      primary: "oklch(0.53 0.15 158)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.33 0.08 158)",
      secondaryForeground: "oklch(0.98 0.01 158)",
      gradientStop: "oklch(0.51 0.15 158)",
      ring: "oklch(0.58 0.15 158)",
    },
  },
  rose: {
    key: "rose",
    label: "Rose",
    swatchClass: "bg-rose-600",
    light: {
      primary: "oklch(0.52 0.20 12)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.91 0.06 12)",
      secondaryForeground: "oklch(0.26 0.10 12)",
      gradientStop: "oklch(0.52 0.20 12)",
      ring: "oklch(0.56 0.19 12)",
    },
    dark: {
      primary: "oklch(0.56 0.20 12)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.34 0.09 12)",
      secondaryForeground: "oklch(0.98 0.01 12)",
      gradientStop: "oklch(0.55 0.19 12)",
      ring: "oklch(0.60 0.19 12)",
    },
  },
  amber: {
    key: "amber",
    label: "Amber",
    swatchClass: "bg-amber-600",
    light: {
      primary: "oklch(0.54 0.17 55)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.91 0.08 80)",
      secondaryForeground: "oklch(0.26 0.09 60)",
      gradientStop: "oklch(0.54 0.17 55)",
      ring: "oklch(0.58 0.16 55)",
    },
    dark: {
      primary: "oklch(0.56 0.17 55)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.36 0.09 70)",
      secondaryForeground: "oklch(0.98 0.01 75)",
      gradientStop: "oklch(0.54 0.17 55)",
      ring: "oklch(0.60 0.16 55)",
    },
  },
  violet: {
    key: "violet",
    label: "Violet",
    swatchClass: "bg-violet-600",
    light: {
      primary: "oklch(0.49 0.22 295)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.90 0.07 295)",
      secondaryForeground: "oklch(0.24 0.10 295)",
      gradientStop: "oklch(0.50 0.21 295)",
      ring: "oklch(0.54 0.20 295)",
    },
    dark: {
      primary: "oklch(0.56 0.22 295)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.34 0.09 295)",
      secondaryForeground: "oklch(0.98 0.01 295)",
      gradientStop: "oklch(0.54 0.21 295)",
      ring: "oklch(0.60 0.20 295)",
    },
  },
  slate: {
    key: "slate",
    label: "Slate",
    swatchClass: "bg-slate-600",
    light: {
      primary: "oklch(0.40 0.06 250)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.90 0.03 250)",
      secondaryForeground: "oklch(0.22 0.04 250)",
      gradientStop: "oklch(0.44 0.07 250)",
      ring: "oklch(0.48 0.06 250)",
    },
    dark: {
      primary: "oklch(0.48 0.06 250)",
      primaryForeground: "oklch(0.99 0 0)",
      secondary: "oklch(0.31 0.04 250)",
      secondaryForeground: "oklch(0.97 0.01 250)",
      gradientStop: "oklch(0.48 0.06 250)",
      ring: "oklch(0.56 0.06 250)",
    },
  },
}

export const THEME_COLOR_LIST = Object.values(THEME_COLORS)

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { MantineColorScheme } from "@mantine/core";

interface ThemeContextType {
  colorScheme: MantineColorScheme;
  toggleColorScheme: () => void;
  isDark: boolean;
  theme: {
    bg: {
      primary: string;
      secondary: string;
      tertiary: string;
      quaternary: string;
      elevated: string;
      surface: string;
      overlay: string;
      modal: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
      disabled: string;
      error: string;
      success: string;
      warning: string;
    };
    border: string;
    shadow: string;
    gradient: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      hero: string;
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      textPrimary: string;
      textSecondary: string;
      border: string;
    };
    glassmorphism: {
      primary: string;
      secondary: string;
      hover: string;
      active: string;
      elevated: string;
    };
    card: {
      background: string;
      border: string;
      shadow: string;
      hoverShadow: string;
      hover: string;
    };
    input: {
      background: string;
      border: string;
      focusBorder: string;
      placeholder: string;
      shadow: string;
    };
    button: {
      primary: string;
      primaryHover: string;
      secondary: string;
      secondaryHover: string;
      outline: string;
      outlineHover: string;
      ghost: string;
      ghostHover: string;
    };
    table: {
      header: string;
      row: string;
      rowHover: string;
      rowSelected: string;
      border: string;
    };
    sidebar: {
      background: string;
      hover: string;
      active: string;
      border: string;
    };
    topbar: {
      background: string;
      border: string;
      shadow: string;
    };
    animation: {
      duration: string;
      easing: string;
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [colorScheme, setColorScheme] = useState<MantineColorScheme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as MantineColorScheme) || "light";
  });

  const toggleColorScheme = useCallback(() => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
    localStorage.setItem("theme", newScheme);
  }, [colorScheme]);

  useEffect(() => {
    localStorage.setItem("theme", colorScheme);
  }, [colorScheme]);
  const isDark = colorScheme === "dark";
  const theme = useMemo(
    () => ({
      bg: {
        primary: isDark ? "#0f172a" : "#ffffff",
        secondary: isDark ? "#1e293b" : "#f8fafc",
        tertiary: isDark ? "#334155" : "#f1f5f9",
        quaternary: isDark ? "#475569" : "#e2e8f0",
        elevated: isDark ? "#1e293b" : "#ffffff",
        surface: isDark ? "#0f172a" : "#f8fafc",
        overlay: isDark
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        modal: isDark ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#e2e8f0" : "#334155",
        muted: isDark ? "#94a3b8" : "#64748b",
        accent: isDark ? "#3b82f6" : "#2563eb",
        disabled: isDark ? "#64748b" : "#94a3b8",
        error: isDark ? "#ef4444" : "#dc2626",
        success: isDark ? "#10b981" : "#059669",
        warning: isDark ? "#f59e0b" : "#d97706",
      },
      border: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
      shadow: isDark
        ? "0 10px 35px -5px rgba(0, 0, 0, 0.4), 0 4px 16px -2px rgba(0, 0, 0, 0.2)"
        : "0 10px 35px -5px rgba(0, 0, 0, 0.15), 0 4px 16px -2px rgba(0, 0, 0, 0.1)",
      gradient: {
        primary: isDark
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
        secondary: isDark
          ? "linear-gradient(135deg, #334155 0%, #475569 100%)"
          : "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
        accent: isDark
          ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
          : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
        success: isDark
          ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
          : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
        warning: isDark
          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        error: isDark
          ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          : "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
        hero: isDark
          ? "linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 25%, #cbd5e1 50%, #94a3b8 75%, #64748b 100%)",
      },
      colors: {
        primary: isDark ? "#3b82f6" : "#2563eb",
        secondary: isDark ? "#64748b" : "#475569",
        accent: isDark ? "#8b5cf6" : "#7c3aed",
        success: isDark ? "#10b981" : "#059669",
        warning: isDark ? "#f59e0b" : "#d97706",
        error: isDark ? "#ef4444" : "#dc2626",
        info: isDark ? "#06b6d4" : "#0891b2",
        textPrimary: isDark ? "#f8fafc" : "#0f172a",
        textSecondary: isDark ? "#e2e8f0" : "#334155",
        border: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
      },
      glassmorphism: {
        primary: isDark
          ? "rgba(15, 23, 42, 0.85)"
          : "rgba(248, 250, 252, 0.85)",
        secondary: isDark
          ? "rgba(30, 41, 59, 0.85)"
          : "rgba(241, 245, 249, 0.85)",
        hover: isDark ? "rgba(51, 65, 85, 0.7)" : "rgba(226, 232, 240, 0.7)",
        active: isDark ? "rgba(71, 85, 105, 0.8)" : "rgba(203, 213, 225, 0.8)",
        elevated: isDark
          ? "rgba(30, 41, 59, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
      },
      card: {
        background: isDark
          ? "rgba(30, 41, 59, 0.8)"
          : "rgba(255, 255, 255, 0.9)",
        border: isDark ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)",
        shadow: isDark
          ? "0 8px 32px -4px rgba(0, 0, 0, 0.3), 0 2px 8px -2px rgba(0, 0, 0, 0.2)"
          : "0 8px 32px -4px rgba(0, 0, 0, 0.12), 0 2px 8px -2px rgba(0, 0, 0, 0.08)",
        hoverShadow: isDark
          ? "0 16px 48px -8px rgba(0, 0, 0, 0.4), 0 4px 16px -4px rgba(0, 0, 0, 0.3)"
          : "0 16px 48px -8px rgba(0, 0, 0, 0.18), 0 4px 16px -4px rgba(0, 0, 0, 0.12)",
        hover: isDark ? "rgba(51, 65, 85, 0.9)" : "rgba(248, 250, 252, 0.95)",
      },
      input: {
        background: isDark
          ? "rgba(30, 41, 59, 0.6)"
          : "rgba(255, 255, 255, 0.8)",
        border: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
        focusBorder: isDark ? "#3b82f6" : "#2563eb",
        placeholder: isDark ? "#94a3b8" : "#64748b",
        shadow: isDark
          ? "inset 0 2px 4px rgba(0, 0, 0, 0.2)"
          : "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
      },
      button: {
        primary: isDark
          ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
          : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        primaryHover: isDark
          ? "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)"
          : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        secondary: isDark
          ? "rgba(51, 65, 85, 0.8)"
          : "rgba(241, 245, 249, 0.8)",
        secondaryHover: isDark
          ? "rgba(71, 85, 105, 0.9)"
          : "rgba(226, 232, 240, 0.9)",
        outline: isDark ? "transparent" : "transparent",
        outlineHover: isDark
          ? "rgba(59, 130, 246, 0.1)"
          : "rgba(37, 99, 235, 0.1)",
        ghost: "transparent",
        ghostHover: isDark
          ? "rgba(59, 130, 246, 0.1)"
          : "rgba(37, 99, 235, 0.1)",
      },
      table: {
        header: isDark ? "rgba(30, 41, 59, 0.9)" : "rgba(248, 250, 252, 0.9)",
        row: isDark ? "rgba(15, 23, 42, 0.3)" : "rgba(255, 255, 255, 0.5)",
        rowHover: isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(241, 245, 249, 0.8)",
        rowSelected: isDark
          ? "rgba(59, 130, 246, 0.2)"
          : "rgba(37, 99, 235, 0.1)",
        border: isDark ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)",
      },
      sidebar: {
        background: isDark
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        hover: isDark ? "rgba(51, 65, 85, 0.6)" : "rgba(241, 245, 249, 0.8)",
        active: isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(37, 99, 235, 0.1)",
        border: isDark ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)",
      },
      topbar: {
        background: isDark
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        border: isDark ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.5)",
        shadow: isDark
          ? "0 4px 24px -4px rgba(0, 0, 0, 0.3)"
          : "0 4px 24px -4px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        duration: "0.3s",
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    }),
    [isDark]
  );

  const value = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme,
      isDark,
      theme,
    }),
    [colorScheme, toggleColorScheme, isDark, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

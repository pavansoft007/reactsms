import { MantineThemeOverride } from "@mantine/core";

export const theme: MantineThemeOverride = {
  primaryColor: "brand",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  colors: {
    brand: [
      "#f0f9ff",
      "#e0f2fe",
      "#bae6fd",
      "#7dd3fc",
      "#38bdf8",
      "#0ea5e9",
      "#0284c7",
      "#0369a1",
      "#075985",
      "#0c4a6e",
    ],
    gray: [
      "#fafafa",
      "#f5f5f5",
      "#e5e5e5",
      "#d4d4d4",
      "#a3a3a3",
      "#737373",
      "#525252",
      "#404040",
      "#262626",
      "#171717",
    ],
    success: [
      "#f0fdf4",
      "#dcfce7",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#15803d",
      "#166534",
      "#14532d",
    ],
    warning: [
      "#fffbeb",
      "#fef3c7",
      "#fde68a",
      "#fcd34d",
      "#fbbf24",
      "#f59e0b",
      "#d97706",
      "#b45309",
      "#92400e",
      "#78350f",
    ],
    danger: [
      "#fef2f2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
      "#65181e",
    ],
  },
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fontWeight: "600",
  },
  components: {
    Button: {
      styles: {
        root: {
          borderRadius: "8px",
          fontWeight: 500,
          transition: "all 0.2s ease",
        },
      },
    },
    Card: {
      styles: {
        root: {
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    Paper: {
      styles: {
        root: {
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          "&:focus": {
            borderColor: "#0ea5e9",
            boxShadow: "0 0 0 3px rgb(14 165 233 / 0.1)",
          },
        },
      },
    },
  },
  globalStyles: (theme) => ({
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
    body: {
      backgroundColor: "#fafafa",
      color: theme.colors.gray[8],
      lineHeight: 1.6,
    },
  }),
};

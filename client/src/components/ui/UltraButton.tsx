import { ReactNode } from 'react';
import { Button, Loader } from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

interface UltraButtonProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "gradient"
    | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  glass?: boolean;
  loading?: boolean;
  onClick?: (event: any) => void;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: string;
}

const UltraButton = ({
  variant = "primary",
  size = "md",
  glow = false,
  glass = false,
  loading,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    xs: { height: "28px", fontSize: "12px", padding: "0 12px" },
    sm: { height: "36px", fontSize: "14px", padding: "0 16px" },
    md: { height: "42px", fontSize: "14px", padding: "0 20px" },
    lg: { height: "50px", fontSize: "16px", padding: "0 24px" },
    xl: { height: "58px", fontSize: "18px", padding: "0 32px" },
  };

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: "12px",
      border: "none",
      fontWeight: 600,
      position: "relative" as const,
      overflow: "hidden",
      transition: `all ${theme.animation.duration} ${theme.animation.easing}`,
      backdropFilter: glass ? "blur(12px)" : "none",
      ...sizeStyles[size],
    };

    const variants = {
      primary: {
        background: theme.button.primary,
        color: "#ffffff",
        "&:hover": {
          background: theme.button.primaryHover,
          transform: "translateY(-1px)",
          boxShadow: `0 8px 25px -8px ${theme.colors.primary}`,
        },
      },
      secondary: {
        background: theme.button.secondary,
        color: theme.text.primary,
        "&:hover": {
          background: theme.button.secondaryHover,
          transform: "translateY(-1px)",
        },
      },
      outline: {
        background: theme.button.outline,
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}`,
        "&:hover": {
          background: theme.button.outlineHover,
          transform: "translateY(-1px)",
        },
      },
      ghost: {
        background: theme.button.ghost,
        color: theme.colors.primary,
        "&:hover": {
          background: theme.button.ghostHover,
        },
      },
      gradient: {
        background: theme.gradient.accent,
        color: "#ffffff",
        "&:hover": {
          background: theme.gradient.primary,
          transform: "translateY(-1px)",
          boxShadow: `0 8px 25px -8px ${theme.colors.accent}`,
        },
      },
      danger: {
        background: theme.gradient.error,
        color: "#ffffff",
        "&:hover": {
          background: theme.colors.error,
          transform: "translateY(-1px)",
          boxShadow: `0 8px 25px -8px ${theme.colors.error}`,
        },
      },
    };

    const glowStyles = glow
      ? {
          boxShadow: `0 0 20px ${theme.colors.primary}33`,
          "&:hover": {
            ...variants[variant]["&:hover"],
            boxShadow: `0 0 30px ${theme.colors.primary}66`,
          },
        }
      : {};

    return {
      ...baseStyles,
      ...variants[variant],
      ...glowStyles,
      ...style,
    };
  };

  return (
    <Button style={getButtonStyles()} disabled={loading} {...props}>
      {loading ? <Loader size="sm" color="white" /> : children}
    </Button>
  );
};

export default UltraButton;

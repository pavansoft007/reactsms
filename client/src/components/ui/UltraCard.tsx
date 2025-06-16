import React from "react";
import { Paper, PaperProps } from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

interface UltraCardProps extends Omit<PaperProps, "children"> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "glassmorphic" | "gradient";
  blur?: boolean;
  glow?: boolean;
  hover?: boolean;
}

const UltraCard: React.FC<UltraCardProps> = ({
  children,
  variant = "default",
  blur = false,
  glow = false,
  hover = true,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: "16px",
      border: `1px solid ${theme.card.border}`,
      overflow: "hidden",
      position: "relative" as const,
      transition: `all ${theme.animation.duration} ${theme.animation.easing}`,
    };

    const variants = {
      default: {
        background: theme.card.background,
        boxShadow: theme.card.shadow,
        backdropFilter: blur ? "blur(12px)" : "none",
      },
      elevated: {
        background: theme.glassmorphism.elevated,
        boxShadow: theme.card.hoverShadow,
        backdropFilter: "blur(16px)",
        border: `1px solid ${theme.card.border}`,
      },
      glassmorphic: {
        background: theme.glassmorphism.primary,
        boxShadow: theme.card.shadow,
        backdropFilter: "blur(20px)",
        border: `1px solid ${theme.card.border}`,
      },
      gradient: {
        background: theme.gradient.primary,
        boxShadow: theme.card.shadow,
        backdropFilter: blur ? "blur(12px)" : "none",
      },
    };

    const hoverStyles = hover
      ? {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.card.hoverShadow,
            background:
              variant === "default"
                ? theme.card.hover
                : variants[variant].background,
          },
        }
      : {};

    const glowStyles = glow
      ? {
          "&::before": {
            content: '""',
            position: "absolute" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.gradient.accent,
            opacity: 0.1,
            borderRadius: "inherit",
            zIndex: -1,
          },
        }
      : {};

    return {
      ...baseStyles,
      ...variants[variant],
      ...hoverStyles,
      ...glowStyles,
      ...style,
    };
  };

  return (
    <Paper style={getCardStyles()} {...props}>
      {children}
    </Paper>
  );
};

export default UltraCard;

import {
  TextInput,
  PasswordInput,
  Textarea,
  Select,
  TextInputProps,
  PasswordInputProps,
  TextareaProps,
  SelectProps,
} from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

type InputVariant = "default" | "filled" | "glass" | "minimal";

interface UltraInputProps extends Omit<TextInputProps, "variant"> {
  variant?: InputVariant;
  glow?: boolean;
}

interface UltraPasswordProps extends Omit<PasswordInputProps, "variant"> {
  variant?: InputVariant;
  glow?: boolean;
}

interface UltraTextareaProps extends Omit<TextareaProps, "variant"> {
  variant?: InputVariant;
  glow?: boolean;
}

interface UltraSelectProps extends Omit<SelectProps, "variant"> {
  variant?: InputVariant;
  glow?: boolean;
}

const getInputStyles = (theme: any, variant: InputVariant, glow: boolean) => {
  const baseStyles = {
    borderRadius: "12px",
    transition: `all ${theme.animation.duration} ${theme.animation.easing}`,
    fontSize: "14px",
  };

  const variants: Record<InputVariant, any> = {
    default: {
      backgroundColor: theme.input.background,
      border: `1px solid ${theme.input.border}`,
      "&:focus": {
        borderColor: theme.input.focusBorder,
        boxShadow: `0 0 0 3px ${theme.input.focusBorder}22`,
      },
    },
    filled: {
      backgroundColor: theme.bg.tertiary,
      border: "none",
      "&:focus": {
        backgroundColor: theme.input.background,
        boxShadow: `0 0 0 3px ${theme.input.focusBorder}22`,
      },
    },
    glass: {
      backgroundColor: theme.glassmorphism.secondary,
      backdropFilter: "blur(12px)",
      border: `1px solid ${theme.input.border}`,
      "&:focus": {
        borderColor: theme.input.focusBorder,
        backgroundColor: theme.glassmorphism.primary,
        boxShadow: `0 0 0 3px ${theme.input.focusBorder}22`,
      },
    },
    minimal: {
      backgroundColor: "transparent",
      border: "none",
      borderBottom: `2px solid ${theme.input.border}`,
      borderRadius: "0",
      "&:focus": {
        borderBottomColor: theme.input.focusBorder,
        boxShadow: "none",
      },
    },
  };

  const glowStyles = glow
    ? {
        boxShadow: `0 0 20px ${theme.input.focusBorder}22`,
        "&:focus": {
          ...(variants[variant]["&:focus"] || {}),
          boxShadow: `0 0 30px ${theme.input.focusBorder}44`,
        },
      }
    : {};

  return {
    ...baseStyles,
    ...variants[variant],
    ...glowStyles,
  };
};

export const UltraInput = ({
  variant = "default",
  glow = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <TextInput
      style={{
        ...getInputStyles(theme, variant, glow),
        ...style,
      }}
      styles={{
        input: getInputStyles(theme, variant, glow),
        label: {
          color: theme.text.primary,
          fontWeight: 500,
          marginBottom: "8px",
        },
      }}
      {...props}
    />
  );
};

export const UltraPassword = ({
  variant = "default",
  glow = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <PasswordInput
      style={{
        ...getInputStyles(theme, variant, glow),
        ...style,
      }}
      styles={{
        input: getInputStyles(theme, variant, glow),
        label: {
          color: theme.text.primary,
          fontWeight: 500,
          marginBottom: "8px",
        },
      }}
      {...props}
    />
  );
};

export const UltraTextarea = ({
  variant = "default",
  glow = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <Textarea
      style={{
        ...getInputStyles(theme, variant, glow),
        ...style,
      }}
      styles={{
        input: getInputStyles(theme, variant, glow),
        label: {
          color: theme.text.primary,
          fontWeight: 500,
          marginBottom: "8px",
        },
      }}
      {...props}
    />
  );
};

export const UltraSelect = ({
  variant = "default",
  glow = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <Select
      style={{
        ...getInputStyles(theme, variant, glow),
        ...style,
      }}
      styles={{
        input: getInputStyles(theme, variant, glow),
        label: {
          color: theme.text.primary,
          fontWeight: 500,
          marginBottom: "8px",
        },
        dropdown: {
          backgroundColor: theme.bg.elevated,
          border: `1px solid ${theme.border}`,
          borderRadius: "12px",
          boxShadow: theme.shadow,
          backdropFilter: "blur(12px)",
        },
        option: {
          "&[data-selected]": {
            backgroundColor: theme.colors.primary,
            color: "#ffffff",
          },
          "&:hover": {
            backgroundColor: theme.glassmorphism.hover,
          },
        },
      }}
      {...props}
    />
  );
};

import React from "react";
import { Modal, ModalProps } from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

interface UltraModalProps extends Omit<ModalProps, "title"> {
  title?: React.ReactNode;
  variant?: "default" | "glass" | "minimal" | "fullscreen";
  blur?: boolean;
}

const UltraModal: React.FC<UltraModalProps> = ({
  title,
  variant = "default",
  blur = true,
  style,
  children,
  onClose,
  ...props
}) => {
  const { theme } = useTheme();

  const getModalStyles = () => {
    const baseStyles = {
      borderRadius: "20px",
      border: `1px solid ${theme.border}`,
      overflow: "hidden",
    };

    const variants = {
      default: {
        backgroundColor: theme.bg.modal,
        boxShadow: theme.shadow,
      },
      glass: {
        backgroundColor: theme.glassmorphism.elevated,
        backdropFilter: "blur(20px)",
        boxShadow: theme.shadow,
      },
      minimal: {
        backgroundColor: theme.bg.primary,
        border: "none",
        boxShadow: "none",
      },
      fullscreen: {
        backgroundColor: theme.bg.modal,
        borderRadius: "0",
        border: "none",
      },
    };

    return {
      ...baseStyles,
      ...variants[variant],
      ...style,
    };
  };

  return (
    <Modal
      styles={{
        content: getModalStyles(),
        header: {
          backgroundColor: "transparent",
          padding: "24px 24px 0 24px",
          marginBottom: "16px",
        },
        body: {
          padding: "0 24px 24px 24px",
        },
        title: {
          fontSize: "20px",
          fontWeight: 600,
          color: theme.text.primary,
          margin: 0,
        },
        close: {
          backgroundColor: theme.glassmorphism.hover,
          border: `1px solid ${theme.border}`,
          borderRadius: "8px",
          color: theme.text.primary,
          "&:hover": {
            backgroundColor: theme.glassmorphism.active,
          },
        },
      }}
      overlayProps={{
        backgroundOpacity: blur ? 0.55 : 0.3,
        blur: blur ? 3 : 0,
      }}
      title={title}
      onClose={onClose}
      {...props}
    >
      {children}
    </Modal>
  );
};

export default UltraModal;

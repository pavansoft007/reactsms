import React from "react";
import { Table, TableProps, ScrollArea, Group, Badge } from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

interface UltraTableProps extends Omit<TableProps, "variant"> {
  variant?: "default" | "glass" | "minimal" | "elevated";
  striped?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number;
}

const UltraTable: React.FC<UltraTableProps> = ({
  variant = "default",
  striped = true,
  hoverable = true,
  stickyHeader = false,
  maxHeight = 600,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getTableStyles = () => {
    const baseStyles = {
      borderRadius: "16px",
      overflow: "hidden",
      border: `1px solid ${theme.table.border}`,
    };

    const variants = {
      default: {
        backgroundColor: theme.bg.elevated,
      },
      glass: {
        backgroundColor: theme.glassmorphism.primary,
        backdropFilter: "blur(12px)",
      },
      minimal: {
        backgroundColor: "transparent",
        border: "none",
      },
      elevated: {
        backgroundColor: theme.bg.elevated,
        boxShadow: theme.shadow,
      },
    };

    return {
      ...baseStyles,
      ...variants[variant],
      ...style,
    };
  };

  const tableContent = (
    <Table
      style={getTableStyles()}
      styles={{
        table: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
        th: {
          background: theme.table.header,
          color: theme.text.primary,
          fontWeight: 600,
          fontSize: "14px",
          padding: "16px 20px",
          borderBottom: `1px solid ${theme.table.border}`,
          backdropFilter: "blur(12px)",
          position: stickyHeader ? "sticky" : "static",
          top: 0,
          zIndex: 10,
        },
        td: {
          padding: "16px 20px",
          borderBottom: `1px solid ${theme.table.border}`,
          color: theme.text.primary,
          fontSize: "14px",
          verticalAlign: "middle",
        },
        tr: (() => {
          const baseRowStyles = striped
            ? {
                "&:nth-of-type(even)": {
                  backgroundColor: theme.table.row,
                },
              }
            : {};

          const hoverStyles = hoverable
            ? {
                "&:hover": {
                  backgroundColor: theme.table.rowHover,
                  transform: "scale(1.01)",
                  transition: `all ${theme.animation.duration} ${theme.animation.easing}`,
                },
              }
            : {};

          return {
            ...baseRowStyles,
            ...hoverStyles,
          };
        })(),
      }}
      {...props}
    >
      {children}
    </Table>
  );

  if (maxHeight) {
    return (
      <ScrollArea h={maxHeight} style={getTableStyles()}>
        {tableContent}
      </ScrollArea>
    );
  }

  return tableContent;
};

// Action icons for table rows
export const UltraTableActions: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Group gap="xs" justify="center">
      {children}
    </Group>
  );
};

// Status badge for table cells
export const UltraTableBadge: React.FC<{
  variant?: "success" | "warning" | "error" | "info" | "default";
  children: React.ReactNode;
}> = ({ variant = "default", children }) => {
  const { theme } = useTheme();

  const colors = {
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
    default: theme.colors.secondary,
  };

  return (
    <Badge
      color={colors[variant]}
      variant="light"
      radius="md"
      style={{
        textTransform: "none",
        fontWeight: 500,
      }}
    >
      {children}
    </Badge>
  );
};

export default UltraTable;

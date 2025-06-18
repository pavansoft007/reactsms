import { ReactNode } from 'react';
import { Text, Box } from "@mantine/core";
import { UltraLoader } from "./UltraLoader";
import { useTheme } from "../../context/ThemeContext";

interface LoadingTableRowsProps {
  loading: boolean;
  itemCount: number;
  colspan: number;
  loadingMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
}

export const LoadingTableRows = ({
  loading,
  itemCount,
  colspan,
  loadingMessage = "Loading data...",
  emptyMessage = "No data found",
  children,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <tr>
        <td colSpan={colspan} style={{ border: "none", padding: 0 }}>
          <UltraLoader size="lg" message={loadingMessage} variant="detailed" />
        </td>
      </tr>
    );
  }

  if (itemCount === 0) {
    return (
      <tr>
        <td colSpan={colspan} style={{ textAlign: "center", padding: "40px" }}>
          <Text size="md" c={theme.text.muted}>
            {emptyMessage}
          </Text>
        </td>
      </tr>
    );
  }

  return <>{children}</>;
};

interface LoadingContainerProps {
  loading: boolean;
  loadingMessage?: string;
  loadingSize?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  minHeight?: string;
}

export const LoadingContainer = ({
  loading,
  loadingMessage = "Loading...",
  loadingSize = "lg",
  children,
  minHeight = "200px",
}) => {
  if (loading) {
    return (
      <Box style={{ minHeight }}>
        <UltraLoader
          size={loadingSize}
          message={loadingMessage}
          variant="detailed"
        />
      </Box>
    );
  }

  return <>{children}</>;
};

const LoadingComponents = { LoadingTableRows, LoadingContainer };
export default LoadingComponents;

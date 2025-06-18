import { Box, Text, Group, Stack } from "@mantine/core";
import { useTheme } from "../../context/ThemeContext";

interface UltraLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  fullscreen?: boolean;
  variant?: "default" | "minimal" | "detailed";
}

export const UltraLoader = ({
  size = "md",
  message = "Loading...",
  fullscreen = false,
  variant = "default",
}) => {
  const { theme } = useTheme();

  const sizeConfig = {
    sm: { loader: 32, text: "sm" as const, container: 200 },
    md: { loader: 48, text: "md" as const, container: 280 },
    lg: { loader: 64, text: "lg" as const, container: 320 },
    xl: { loader: 80, text: "xl" as const, container: 400 },
  };

  const config = sizeConfig[size];

  const LoaderContent = () => (
    <Stack
      align="center"
      gap="lg"
      style={{
        width: config.container,
        padding: variant === "minimal" ? "20px" : "40px",
      }}
    >
      {/* Main Loader */}
      <Box style={{ position: "relative" }}>
        {/* Outer Ring */}
        <Box
          style={{
            width: config.loader + 20,
            height: config.loader + 20,
            borderRadius: "50%",
            border: `3px solid ${theme.glassmorphism.primary}`,
            borderTop: `3px solid ${theme.colors.accent}`,
            animation: "spin 1s linear infinite",
            position: "absolute",
            top: -10,
            left: -10,
          }}
        />

        {/* Middle Ring */}
        <Box
          style={{
            width: config.loader + 10,
            height: config.loader + 10,
            borderRadius: "50%",
            border: `2px solid ${theme.glassmorphism.secondary}`,
            borderRight: `2px solid ${theme.colors.primary}`,
            animation: "spin 1.5s linear infinite reverse",
            position: "absolute",
            top: -5,
            left: -5,
          }}
        />

        {/* Inner Core */}
        <Box
          style={{
            width: config.loader,
            height: config.loader,
            borderRadius: "50%",
            background: theme.gradient.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${theme.colors.accent}40`,
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          {/* Pathasala Pro Logo/Icon */}
          <Text
            size={size === "sm" ? "xs" : size === "md" ? "sm" : "md"}
            fw={700}
            c="white"
            style={{
              textShadow: "0 0 10px rgba(255,255,255,0.8)",
            }}
          >
            PP
          </Text>
        </Box>

        {/* Floating Particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Box
            key={i}
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: theme.colors.accent,
              animation: `float-particle 3s ease-in-out infinite ${i * 0.5}s`,
              top: `${20 + i * 15}%`,
              right: `${10 + i * 10}%`,
              boxShadow: `0 0 10px ${theme.colors.accent}`,
            }}
          />
        ))}
      </Box>

      {/* Loading Text */}
      {variant !== "minimal" && (
        <Stack align="center" gap="xs">
          <Text
            size={config.text}
            fw={600}
            c={theme.text.primary}
            style={{
              background: theme.gradient.accent,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Pathasala Pro
          </Text>

          <Text size="sm" c={theme.text.secondary} ta="center">
            {message}
          </Text>

          {/* Progress Dots */}
          <Group gap="xs" mt="xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: theme.colors.accent,
                  animation: `dot-bounce 1.5s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </Group>
        </Stack>
      )}

      {variant === "detailed" && (
        <Box
          style={{
            width: "100%",
            height: 2,
            background: theme.glassmorphism.primary,
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "40%",
              background: theme.gradient.accent,
              borderRadius: 2,
              animation: "loading-bar 2s ease-in-out infinite",
            }}
          />
        </Box>
      )}
    </Stack>
  );

  if (fullscreen) {
    return (
      <Box
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `${theme.bg.primary}ee`,
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <Box
          style={{
            background: theme.glassmorphism.elevated,
            borderRadius: 20,
            border: `1px solid ${theme.border}`,
            backdropFilter: "blur(20px)",
            boxShadow: theme.card.hoverShadow,
          }}
        >
          <LoaderContent />
        </Box>

        {/* Global Styles */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.05); opacity: 0.8; }
            }
            
            @keyframes float-particle {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
              25% { transform: translateY(-10px) translateX(5px); opacity: 1; }
              50% { transform: translateY(-5px) translateX(-3px); opacity: 0.8; }
              75% { transform: translateY(-15px) translateX(2px); opacity: 0.9; }
            }
            
            @keyframes dot-bounce {
              0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
              40% { transform: scale(1.2); opacity: 1; }
            }
            
            @keyframes loading-bar {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(0%); }
              100% { transform: translateX(100%); }
            }
          `}
        </style>
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: variant === "minimal" ? "100px" : "200px",
        width: "100%",
      }}
    >
      <LoaderContent />
    </Box>
  );
};

export default UltraLoader;

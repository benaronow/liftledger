import { ReactNode } from "react";
import { View } from "react-native";
import { IconButton, PaperProvider, useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../theme";
import { SectionCard } from "./SectionCard";

export type InfoActionVariant = "primary" | "danger";

export interface InfoAction {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: InfoActionVariant;
  accessibilityLabel?: string;
}

interface Props {
  title: string;
  actions?: InfoAction[];
  titleAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  // Stretch the card to fill its parent, letting the children area flex (and
  // scroll) while any actions stay pinned at the bottom.
  fill?: boolean;
  children: ReactNode;
}

export const Info = ({ title, actions, fill, children }: Props) => {
  const theme = useTheme();
  const { colors } = theme;

  const containerColor = (action: InfoAction) =>
    action.variant === "danger"
      ? action.disabled
        ? colors.errorContainer
        : colors.error
      : action.disabled
        ? colors.surfaceDisabled
        : colors.primary;

  return (
    <SectionCard
      title={title}
      style={{ marginBottom: SPACING.lg, ...(fill && { flex: 1 }) }}
    >
      <View
        style={[
          { borderRadius: RADIUS.md, overflow: "hidden" },
          fill && { flex: 1 },
        ]}
      >
        <View
          style={{
            flex: fill ? 1 : undefined,
            gap: SPACING.md,
          }}
        >
          {children}
          {actions && actions.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
                marginTop: SPACING.sm,
              }}
            >
              {actions.map((action, idx) => (
                <View key={idx} style={{ flex: 1 }}>
                  <PaperProvider
                    theme={{
                      ...theme,
                      colors: {
                        ...colors,
                        surfaceDisabled: containerColor(action),
                      },
                    }}
                  >
                    <IconButton
                      style={{
                        margin: 0,
                        width: "100%",
                        height: 40,
                        borderRadius: RADIUS.md,
                      }}
                      icon={action.icon}
                      accessibilityLabel={action.accessibilityLabel}
                      mode="contained"
                      containerColor={containerColor(action)}
                      iconColor={
                        action.disabled
                          ? colors.onSurfaceDisabled
                          : colors.onPrimary
                      }
                      disabled={action.disabled}
                      onPress={action.onPress}
                    />
                  </PaperProvider>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </SectionCard>
  );
};

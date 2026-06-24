import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { View } from "react-native";
import { IconButton, PaperProvider, Surface, Text, useTheme } from "../paper";
import { FONT, RADIUS, SPACING } from "../theme";

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
  // A small icon button shown in the top-right of the title row (e.g. the
  // "full progress" shortcut on CompleteDay's chart card).
  titleAction?: {
    icon: string;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  disabledMessage?: string;
  children: ReactNode;
}

// A titled card with a body and a row of equal-width action buttons — the
// repeating unit for days (EditWeek) and exercises (EditDay). When
// disabledMessage is set, a dimming overlay covers the whole card.
export const Info = ({
  title,
  actions,
  titleAction,
  disabledMessage,
  children,
}: Props) => {
  const theme = useTheme();
  const { colors } = theme;

  const containerColor = (action: InfoAction) =>
    action.variant === "danger"
      ? action.disabled
        ? colors.dangerDisabled
        : colors.danger
      : action.disabled
        ? colors.primaryDisabled
        : colors.primary;

  return (
    <Surface
      elevation={1}
      style={{
        width: "100%",
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
      }}
    >
      {/* overflow:hidden lives here, not on the Surface — clipping the Surface
          directly suppresses its shadow. */}
      <View style={{ borderRadius: RADIUS.md, overflow: "hidden" }}>
        <View
          style={{
            gap: SPACING.md,
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.md,
            backgroundColor: colors.container,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: FONT.base,
              fontWeight: "800",
              alignSelf: "flex-start",
            }}
          >
            {title}
          </Text>
          {/* Absolutely positioned so the title sits at the same spot as a
              card with no action (e.g. "Sets") rather than centering against
              the taller button. */}
          {titleAction && (
            <IconButton
              style={{ position: "absolute", top: 0, right: 0, margin: 0 }}
              icon={titleAction.icon}
              size={20}
              iconColor={colors.primary}
              accessibilityLabel={titleAction.accessibilityLabel}
              onPress={titleAction.onPress}
            />
          )}
          {children}
          {actions && actions.length > 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
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
                        action.disabled ? colors.textDisabled : colors.onPrimary
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
        {!!disabledMessage && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACING.md,
              padding: SPACING.lg,
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <View
              style={{
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
              }}
            >
              <MaterialCommunityIcons
                name="alert"
                size={26}
                color={colors.danger}
              />
            </View>
            <Text
              style={{
                flex: 1,
                color: "white",
                fontWeight: "700",
                fontSize: FONT.sm,
              }}
            >
              {disabledMessage}
            </Text>
          </View>
        )}
      </View>
    </Surface>
  );
};

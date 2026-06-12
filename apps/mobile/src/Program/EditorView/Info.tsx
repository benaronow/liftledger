import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { View } from "react-native";
import { IconButton, Surface, Text, useTheme } from "../../paper";
import { FONT, RADIUS, SPACING } from "../../theme";

export type InfoActionVariant = "primary" | "danger";

export interface InfoAction {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: InfoActionVariant;
}

interface Props {
  title: string;
  actions?: InfoAction[];
  disabledMessage?: string;
  children: ReactNode;
}

// A titled card with a body and a row of equal-width action buttons — the
// repeating unit for days (EditWeek) and exercises (EditDay). When
// disabledMessage is set, a dimming overlay covers the whole card.
export const Info = ({ title, actions, disabledMessage, children }: Props) => {
  const { colors } = useTheme();

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
                  <IconButton
                    style={{
                      margin: 0,
                      width: "100%",
                      height: 40,
                      borderRadius: RADIUS.md,
                    }}
                    icon={action.icon}
                    mode="contained"
                    containerColor={containerColor(action)}
                    iconColor={
                      action.disabled ? colors.textDisabled : colors.onPrimary
                    }
                    disabled={action.disabled}
                    onPress={action.onPress}
                  />
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

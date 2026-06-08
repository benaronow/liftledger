import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { View } from "react-native";
import { Surface, Text, useTheme } from "../../paper";
import { ActionButton, Variant } from "../../components/ActionButton";
import { FONT, RADIUS, SPACING } from "../../theme";

export interface InfoAction {
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
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
          alignItems: "center",
          justifyContent: "center",
          padding: SPACING.xs,
          backgroundColor: colors.dark,
        }}
      >
        <Text style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}>{title}</Text>
      </View>
      <View style={{ gap: SPACING.sm, padding: SPACING.sm, backgroundColor: colors.container }}>{children}</View>
      {actions && actions.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.sm,
            padding: SPACING.sm,
            backgroundColor: colors.dark,
          }}
        >
          {actions.map((action, idx) => (
            <View key={idx} style={{ flex: 1 }}>
              <ActionButton
                icon={action.icon}
                onPress={action.onPress}
                disabled={action.disabled}
                variant={action.variant}
                height={40}
              />
            </View>
          ))}
        </View>
      )}
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
            <MaterialCommunityIcons name="alert" size={26} color={colors.danger} />
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

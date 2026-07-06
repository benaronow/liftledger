import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Portal, Surface, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../../../theme";

type Props = {
  open: boolean;
  onClose: () => void;
  restDays: number;
  restDaysRemaining: number;
  accentColor: string;
};

export const StreakInfoDialog = ({
  open,
  onClose,
  restDays,
  restDaysRemaining,
  accentColor,
}: Props) => {
  const { colors } = useTheme();
  if (!open) return null;

  const restDaysColor =
    restDaysRemaining === 0
      ? colors.error
      : restDaysRemaining === 1
        ? colors.tertiaryContainer
        : colors.onSurfaceDisabled;

  return (
    <Portal>
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING.lg,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{ width: "100%", maxWidth: 360 }}>
          <Surface
            style={{
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              gap: SPACING.md,
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.sm,
              }}
            >
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={accentColor}
              />
              <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                Streak
              </Text>
            </View>
            <Text
              style={{
                color: colors.onSurface,
                fontSize: FONT.base,
                marginBottom: SPACING.sm,
              }}
            >
              Your streak is the run of days you&apos;ve completed a session.
              You have allotted yourself {restDays} rest{" "}
              {restDays === 1 ? "day" : "days"} each rotation, which you can
              take without losing your streak. The allowance refreshes when you
              start a new rotation, and resting more than that resets the streak
              to zero.
            </Text>
            <Text
              style={{
                fontSize: FONT.sm,
                fontWeight: "600",
                letterSpacing: 1,
                color: colors.onSurfaceDisabled,
              }}
            >
              <Text style={{ fontWeight: "800", color: restDaysColor }}>
                {restDaysRemaining}
              </Text>
              {"  "}
              REST {restDaysRemaining === 1 ? "DAY" : "DAYS"} LEFT THIS ROTATION
            </Text>
          </Surface>
        </Pressable>
      </Pressable>
    </Portal>
  );
};

import { Text, Switch, useTheme } from "react-native-paper";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { useState } from "react";
import { View } from "react-native";
import { FONT, SPACING } from "../../../theme";

interface Props {
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => Promise<unknown>;
  disabled?: boolean;
}

export const ToggleSetting = ({
  label,
  description,
  value,
  onChange,
  disabled,
}: Props) => {
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const shown = optimistic ?? value;

  const toggle = async () => {
    const next = !shown;
    setOptimistic(next);
    try {
      await onChange(next);
    } catch {
      showSnackbar("Failed to update timer setting.", "error");
    } finally {
      setOptimistic(null);
    }
  };

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}
    >
      <View style={{ justifyContent: "center" }}>
        <Switch
          value={shown}
          onValueChange={toggle}
          disabled={disabled}
          color={colors.primary}
          style={{ transform: [{ scale: 0.85 }] }}
          trackColor={{ true: colors.primary, false: colors.surfaceVariant }}
          ios_backgroundColor={colors.surfaceVariant}
        />
      </View>
      <View style={{ flexShrink: 1, gap: SPACING.xs }}>
        <Text
          style={{
            color: disabled ? colors.onSurfaceDisabled : colors.onSurface,
            fontSize: FONT.base,
            fontWeight: "500",
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              color: disabled
                ? colors.onSurfaceDisabled
                : colors.onSurfaceVariant,
              fontSize: FONT.sm,
              fontWeight: "300",
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

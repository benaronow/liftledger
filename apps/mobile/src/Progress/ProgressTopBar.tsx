import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { FAB_EDGE, FAB_GAP, FAB_SIZE, FAB_TOP } from "../layout";
import type { ProgressStackNav } from "../RootNavigator/types";
import { RADIUS, SPACING } from "../theme";

interface SaveAction {
  saving: boolean;
  onPress: () => void;
}

interface Props {
  showBack?: boolean;
  /** When present, a Save FAB is pinned rightmost. */
  save?: SaveAction;
}

interface Button {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  loading?: boolean;
  disabled?: boolean;
}

export const ProgressActions = ({ showBack, save }: Props) => {
  const { colors } = useTheme();
  const navigation = useNavigation<ProgressStackNav<"ProgramDetail">>();

  // Back sits just left of Save; both are primary actions pinned to the right.
  const buttons: Button[] = [
    ...(showBack
      ? [
          {
            icon: "arrow-left",
            onPress: () => navigation.goBack(),
            accessibilityLabel: "Back",
          },
        ]
      : []),
    ...(save
      ? [
          {
            icon: "content-save",
            onPress: save.onPress,
            accessibilityLabel: "Save",
            loading: save.saving,
            disabled: save.saving,
          },
        ]
      : []),
  ];

  if (!buttons.length) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: FAB_TOP + SPACING.xs,
        right: FAB_EDGE,
        flexDirection: "row",
        gap: FAB_GAP,
        zIndex: 10,
      }}
    >
      {buttons.map((btn) => (
        <FAB
          key={btn.icon}
          icon={btn.icon}
          size="small"
          customSize={FAB_SIZE}
          color="white"
          accessibilityLabel={btn.accessibilityLabel}
          loading={btn.loading}
          disabled={btn.disabled}
          style={{
            backgroundColor: colors.primary,
            borderRadius: RADIUS.lg,
          }}
          onPress={btn.onPress}
        />
      ))}
    </View>
  );
};

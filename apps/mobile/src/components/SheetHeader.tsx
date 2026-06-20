import { View } from "react-native";
import { Button, Text, useTheme } from "../paper";
import { FONT, SPACING } from "../theme";

export interface SheetAction {
  label: string;
  onPress: () => void;
  // Defaults to the theme primary (Done / Save). Cancel passes danger.
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
}

interface Props {
  title: string;
  // Right-aligned text buttons: a single "Done", or "Cancel" + "Save".
  actions: SheetAction[];
}

// The header row shared by the app's full-screen page sheets (SearchableSelect,
// the Edit-Exercises list and its add/edit sub-sheet): a title on the left and
// one or more text actions on the right.
export const SheetHeader = ({ title, actions }: Props) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: SPACING.lg,
        paddingRight: SPACING.sm,
        marginBottom: SPACING.sm,
      }}
    >
      <Text
        style={{ color: colors.text, fontSize: FONT.lg, fontWeight: "600" }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: "row" }}>
        {actions.map((action, idx) => (
          <Button
            key={idx}
            onPress={action.onPress}
            textColor={action.textColor ?? colors.primary}
            disabled={action.disabled}
            loading={action.loading}
          >
            {action.label}
          </Button>
        ))}
      </View>
    </View>
  );
};

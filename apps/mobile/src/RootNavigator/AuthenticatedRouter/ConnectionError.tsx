import { View } from "react-native";
import { Button, Text, useTheme } from "../../paper";
import { FONT, RADIUS, SPACING } from "../../theme";

// Shown when the authenticated DB-user fetch fails for a reason other than a
// genuine 404 (server down / network outage). Distinct from CreateAccount,
// which is only correct when the user truly has no account yet.
export const ConnectionError = ({ onRetry }: { onRetry: () => void }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.xl,
        padding: SPACING.xl,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: FONT.lg, textAlign: "center" }}>
        Something went wrong. Please try again.
      </Text>
      <Button
        mode="contained"
        onPress={onRetry}
        style={{ minWidth: 180, borderRadius: RADIUS.md }}
        contentStyle={{ paddingVertical: SPACING.xs }}
        labelStyle={{ fontSize: FONT.base, fontWeight: "600" }}
      >
        Try again
      </Button>
    </View>
  );
};

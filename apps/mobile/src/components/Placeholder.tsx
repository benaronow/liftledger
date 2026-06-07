import { View } from "react-native";
import { Text, useTheme } from "../paper";

// Temporary stub for screens not yet built. Each milestone replaces the
// corresponding screen with its real implementation.
export const Placeholder = ({ title }: { title: string }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <Text variant="titleLarge">{title}</Text>
    </View>
  );
};

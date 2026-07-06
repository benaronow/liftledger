import { View } from "react-native";
import { ActivityIndicator, Checkbox, useTheme } from "react-native-paper";

interface Props {
  status: "checked" | "unchecked";
  loading?: boolean;
  onPress?: () => void;
}

export const LoadingCheckbox = ({ status, loading, onPress }: Props) => {
  const { colors } = useTheme();

  if (loading)
    return (
      <View
        style={{
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size={18} color={colors.primary} />
      </View>
    );

  return (
    <Checkbox.Android
      status={status}
      color={colors.primary}
      uncheckedColor={colors.onSurfaceVariant}
      onPress={onPress}
    />
  );
};

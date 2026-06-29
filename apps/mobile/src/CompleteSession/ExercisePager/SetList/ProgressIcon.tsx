import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  sign?: number;
  isSetComplete: boolean;
  isSetSkipped?: boolean;
}

export const ProgressIcon = ({ sign, isSetComplete, isSetSkipped }: Props) => {
  const { colors } = useTheme();
  const background = useMemo(() => {
    if (!isSetComplete && !isSetSkipped) return "#7D7D82";

    if (sign === undefined || isSetSkipped) return "#7D7D82";

    if (sign === 0) return colors.tertiaryContainer;

    return sign > 0 ? colors.tertiary : colors.error;
  }, [sign, isSetComplete, isSetSkipped, colors]);

  const icon = useMemo(() => {
    if (isSetSkipped) return { name: "skip-next" as const, size: 16 };
    if (!isSetComplete) return { name: "dots-horizontal" as const, size: 18 };
    if (sign && sign > 0) return { name: "chevron-up" as const, size: 18 };
    if (sign && sign < 0) return { name: "chevron-down" as const, size: 18 };
    return sign !== undefined
      ? { name: "equal" as const, size: 16 }
      : { name: "circle-outline" as const, size: 14 };
  }, [sign, isSetComplete, isSetSkipped]);

  return (
    <View
      style={{
        width: 25,
        height: 25,
        borderRadius: 12.5,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: background,
      }}
    >
      <MaterialCommunityIcons name={icon.name} size={icon.size} color="white" />
    </View>
  );
};

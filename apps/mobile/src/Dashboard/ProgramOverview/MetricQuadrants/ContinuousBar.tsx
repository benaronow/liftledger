import { View, type LayoutChangeEvent } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  fillPercent: number;
  color?: string;
  background?: string;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export const ContinuousBar = ({
  fillPercent,
  color,
  background,
  onLayout,
}: Props) => {
  const { colors } = useTheme();

  return (
    <View
      onLayout={onLayout}
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: background ?? colors.surface,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: `${fillPercent * 100}%`,
          backgroundColor: color ?? colors.primary,
        }}
      />
    </View>
  );
};

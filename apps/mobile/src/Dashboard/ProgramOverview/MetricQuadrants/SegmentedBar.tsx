import { useTheme } from "../../../paper";
import { View } from "react-native";

const SEG_GAP = 3;

export const SegmentedBar = ({
  count,
  filled,
}: {
  count: number;
  filled: number;
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, gap: SEG_GAP }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor:
              i < filled
                ? colors.primary
                : i === filled
                  ? colors.secondary
                  : colors.container,
          }}
        />
      ))}
    </View>
  );
};

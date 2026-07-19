import { useState } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useTheme } from "react-native-paper";
import { BarPulse } from "./BarPulse";

type Props = {
  fillPercent: number;
  color?: string;
  baseColor?: string | null;
  pulse?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
};

export const ContinuousBar = ({
  fillPercent,
  color,
  baseColor,
  pulse,
  onLayout,
}: Props) => {
  const { colors } = useTheme();
  const [fillHeight, setFillHeight] = useState(0);

  return (
    <View
      onLayout={onLayout}
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: colors.secondaryContainer,
        overflow: "hidden",
      }}
    >
      {baseColor && (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: baseColor }]}
        />
      )}
      <View
        onLayout={(e) => setFillHeight(e.nativeEvent.layout.height)}
        style={{
          height: `${fillPercent * 100}%`,
          backgroundColor: color ?? colors.primary,
          overflow: "hidden",
        }}
      >
        {pulse && fillPercent > 0 && fillHeight > 0 && (
          <BarPulse fillHeight={fillHeight} />
        )}
      </View>
    </View>
  );
};

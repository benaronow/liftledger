import { View, type ViewStyle } from "react-native";
import { useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../../../../theme";
import { TitleRow } from "../TitleRow";
import { ReactNode } from "react";

const BAR_INSET = SPACING.sm;
const OUTER_RADIUS = RADIUS.md;

export type Corner = "tl" | "tr" | "bl" | "br";
export type Align = "left" | "right";

const cornerRadii: Record<Corner, ViewStyle> = {
  tl: { borderTopLeftRadius: OUTER_RADIUS },
  tr: { borderTopRightRadius: OUTER_RADIUS },
  bl: { borderBottomLeftRadius: OUTER_RADIUS },
  br: { borderBottomRightRadius: OUTER_RADIUS },
};

type Props = {
  corner: Corner;
  label: string;
  value: string;
  bar: ReactNode;
};

export const Quadrant = ({ corner, label, value, bar }: Props) => {
  const { colors } = useTheme();
  const right = corner === "tr" || corner === "br";
  const bottom = corner === "bl" || corner === "br";
  const align: Align = right ? "right" : "left";
  const title = <TitleRow label={label} value={value} align={align} />;

  const barFrame = (
    <View
      style={{
        flex: 1,
        paddingHorizontal: BAR_INSET,
        paddingTop: bottom ? BAR_INSET : 0,
        paddingBottom: bottom ? 0 : BAR_INSET,
      }}
    >
      {bar}
    </View>
  );

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.primaryContainer,
          overflow: "hidden",
        },
        cornerRadii[corner],
      ]}
    >
      {bottom ? (
        <>
          {barFrame}
          {title}
        </>
      ) : (
        <>
          {title}
          {barFrame}
        </>
      )}
    </View>
  );
};

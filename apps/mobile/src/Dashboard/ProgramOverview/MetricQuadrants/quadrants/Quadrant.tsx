import { View, type ViewStyle } from "react-native";
import { useTheme } from "../../../../paper";
import { RADIUS, SPACING } from "../../../../theme";
import { TitleRow } from "../TitleRow";
import { ReactNode } from "react";

const BAR_INSET = SPACING.sm;
const OUTER_RADIUS = RADIUS.xl;

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
  // Inset the bar so the dark card shows as a frame "containing" it. The side
  // touching the title already has the title's padding as its frame.
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
        { flex: 1, backgroundColor: colors.dark, overflow: "hidden" },
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

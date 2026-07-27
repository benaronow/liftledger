import { ReactNode, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../theme";

const EXPAND_MS = 200;

interface Props {
  title: string;
  subtitle?: string;
  emphasis?: boolean;
  defaultExpanded?: boolean;
  /** When provided (with `onToggle`), the row is controlled by the parent. */
  expanded?: boolean;
  onToggle?: () => void;
  right?: ReactNode;
  children: ReactNode;
}

export const AccordionRow = ({
  title,
  subtitle,
  emphasis,
  defaultExpanded,
  expanded: expandedProp,
  onToggle,
  right,
  children,
}: Props) => {
  const { colors } = useTheme();
  const [internalExpanded, setInternalExpanded] = useState(!!defaultExpanded);

  const controlled = onToggle !== undefined;
  const expanded = controlled ? !!expandedProp : internalExpanded;
  const toggle = controlled
    ? onToggle
    : () => setInternalExpanded((prev) => !prev);

  const rotation = useSharedValue(defaultExpanded ? 1 : 0);
  useEffect(() => {
    rotation.value = withTiming(expanded ? 1 : 0, { duration: EXPAND_MS });
  }, [expanded, rotation]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Animated.View
      layout={LinearTransition.duration(EXPAND_MS)}
      style={{
        borderRadius: RADIUS.sm,
        overflow: "hidden",
        backgroundColor: colors.surface,
      }}
    >
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          minHeight: 40,
          paddingLeft: SPACING.md,
          paddingRight: SPACING.sm,
          paddingVertical: SPACING.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: emphasis ? FONT.base : FONT.sm,
              fontWeight: emphasis ? "800" : "700",
              color: colors.onSurface,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{ fontSize: FONT.xs, color: colors.onSurfaceVariant }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
        <Animated.View style={chevronStyle}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={22}
            color={colors.onSurfaceVariant}
          />
        </Animated.View>
      </Pressable>
      {expanded ? (
        <Animated.View
          entering={FadeIn.duration(EXPAND_MS)}
          exiting={FadeOut.duration(EXPAND_MS / 2)}
          style={{
            paddingLeft: SPACING.md,
            paddingRight: SPACING.sm,
            paddingBottom: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

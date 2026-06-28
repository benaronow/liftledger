import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";

const TAB_BAR_HEIGHT = 68;
const ICON_SIZE = 24;
const TAB_WIDTH = 72;
const CIRCLE_SIZE = 74;

export const floatingTabBarClearance = (bottomInset: number) =>
  TAB_BAR_HEIGHT + bottomInset + SPACING.md;

export const FloatingTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  // Drives the sliding selection circle. Tracks the focused tab index and
  // animates toward it whenever the active tab changes.
  const indicatorIndex = useRef(new Animated.Value(state.index)).current;

  useEffect(() => {
    Animated.spring(indicatorIndex, {
      toValue: state.index,
      useNativeDriver: true,
      friction: 9,
      tension: 90,
    }).start();
  }, [state.index, indicatorIndex]);

  // Circle is centered within each TAB_WIDTH slot, so its left edge sits at
  // index * TAB_WIDTH + (TAB_WIDTH - CIRCLE_SIZE) / 2.
  const translateX = indicatorIndex.interpolate({
    inputRange: [0, 1],
    outputRange: [
      (TAB_WIDTH - CIRCLE_SIZE) / 2,
      TAB_WIDTH + (TAB_WIDTH - CIRCLE_SIZE) / 2,
    ],
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        bottom,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          height: TAB_BAR_HEIGHT,
          borderRadius: TAB_BAR_HEIGHT / 2,
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          backgroundColor: colors.surfaceVariant,
        }}
      >
        {/* Single circle that slides to sit behind the focused tab. */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            backgroundColor: "white",
            shadowColor: "white",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 8,
            elevation: 6,
            transform: [{ translateX }],
          }}
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.title === "string" ? options.title : route.name;
          const isFocused = state.index === index;
          const color = isFocused ? colors.secondary : colors.onSurfaceDisabled;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              style={{
                width: TAB_WIDTH,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: CIRCLE_SIZE,
                  height: CIRCLE_SIZE,
                  borderRadius: CIRCLE_SIZE / 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color,
                  size: ICON_SIZE,
                })}
                <Text
                  style={{
                    fontSize: 10,
                    marginTop: 2,
                    color,
                  }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

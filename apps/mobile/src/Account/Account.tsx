import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { History } from "./History";
import { Profile } from "./Profile";
import { Settings } from "./Settings/";
import { FONT, SPACING } from "../theme";

type AccountTab = "profile" | "settings" | "history";

const TABS: { label: string; value: AccountTab }[] = [
  { label: "Profile", value: "profile" },
  { label: "History", value: "history" },
  { label: "Settings", value: "settings" },
];

export const Account = () => {
  const { colors } = useTheme();
  const [tab, setTab] = useState<AccountTab>("profile");
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / TABS.length;

  // Slide the underline to the active tab. Driven by translateX so it can run
  // on the native thread; recomputed when the bar is (re)measured.
  const indicatorX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const index = TABS.findIndex((t) => t.value === tab);
    Animated.timing(indicatorX, {
      toValue: index * tabWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [tab, tabWidth, indicatorX]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{ backgroundColor: colors.primaryContainer }}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        <View style={{ flexDirection: "row" }}>
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <Pressable
                key={t.value}
                onPress={() => setTab(t.value)}
                style={({ pressed }) => ({
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: SPACING.md,
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: FONT.base,
                    fontWeight: active ? "700" : "500",
                    color: active ? colors.primary : colors.surfaceDisabled,
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: tabWidth,
            height: 2,
            backgroundColor: colors.primary,
            transform: [{ translateX: indicatorX }],
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        {tab === "profile" && <Profile />}
        {tab === "settings" && <Settings />}
        {tab === "history" && <History />}
      </View>
    </View>
  );
};

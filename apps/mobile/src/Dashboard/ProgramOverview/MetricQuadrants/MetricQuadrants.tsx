import { Program } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { useCurrentDay } from "@liftledger/api-client";
import { Text, TouchableRipple, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../../theme";
import { TabNav } from "../../../RootNavigator/types";
import {
  DayQuadrant,
  WeekQuadrant,
  PercentQuadrant,
  StreakQuadrant,
} from "./quadrants";
import { StreakFlame } from "./quadrants/StreakFlame";

const BUTTON_SIZE = 120;
const GAP = SPACING.lg;
const MOAT_DIAMETER = BUTTON_SIZE + GAP * 2;
const BAR_INSET = SPACING.sm;
const DARK_RING_DIAMETER = MOAT_DIAMETER + BAR_INSET * 2;

type Props = {
  program: Program;
};

export const MetricQuadrants = ({ program }: Props) => {
  const { colors } = useTheme();
  const { isDayStarted } = useCurrentDay();
  const navigation = useNavigation<TabNav<"Dashboard">>();

  const [areaSize, setAreaSize] = useState({ width: 0, height: 0 });
  const onLayout = (e: LayoutChangeEvent) => setAreaSize(e.nativeEvent.layout);

  const [streakBarHeight, setStreakBarHeight] = useState(0);

  return (
    <View style={{ flex: 1, width: "100%" }} onLayout={onLayout}>
      <View style={{ flex: 1, flexDirection: "row", gap: GAP }}>
        <DayQuadrant program={program} />
        <WeekQuadrant program={program} />
      </View>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          gap: GAP,
          marginTop: GAP,
        }}
      >
        <PercentQuadrant program={program} />
        <StreakQuadrant
          program={program}
          onLayout={(e: LayoutChangeEvent) =>
            setStreakBarHeight(e.nativeEvent.layout.height)
          }
        />
      </View>

      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: DARK_RING_DIAMETER,
          height: DARK_RING_DIAMETER,
          marginTop: -DARK_RING_DIAMETER / 2,
          marginLeft: -DARK_RING_DIAMETER / 2,
          borderRadius: RADIUS.pill,
          backgroundColor: colors.surfaceVariant,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: GAP,
          marginLeft: -GAP / 2,
          backgroundColor: colors.background,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: GAP,
          marginTop: -GAP / 2,
          backgroundColor: colors.background,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: MOAT_DIAMETER,
          height: MOAT_DIAMETER,
          marginTop: -MOAT_DIAMETER / 2,
          marginLeft: -MOAT_DIAMETER / 2,
          borderRadius: RADIUS.pill,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TouchableRipple
          borderless
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => navigation.navigate("CompleteDay")}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: "white",
                fontSize: FONT.lg,
                fontWeight: "900",
                letterSpacing: 1,
              }}
            >
              {isDayStarted ? "Resume" : "Start"}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: FONT.lg,
                fontWeight: "900",
                letterSpacing: 1,
              }}
            >
              Workout
            </Text>
          </View>
        </TouchableRipple>
      </View>
      <StreakFlame
        program={program}
        grid={areaSize}
        barHeight={streakBarHeight}
        keepOutRadius={DARK_RING_DIAMETER / 2}
      />
    </View>
  );
};

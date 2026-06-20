import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useCurrentDay, useMe, useTimerEnd } from "@liftledger/api-client";
import { FAB_EDGE, FAB_GAP, FAB_SIZE, FAB_TOP } from "../../layout";
import { FAB, Text, useTheme } from "../../paper";
import { FONT, RADIUS, SPACING } from "../../theme";
import { EditExercisesModal } from "./EditExercisesModal/EditExercisesModal";
import { EditGymDialog } from "./EditGymDialog";
import { TimerSettingsDialog } from "./TimerSettingsDialog";

interface Props {
  isFinishing: boolean;
}

// Pinned top-right speed dial, across from the exercise title. Paper's
// FAB.Group only anchors bottom-right, so this rebuilds the same idea from
// its parts — a primary FAB that flips between dots/close, labeled small FABs
// dropping down beneath it, and a dimming backdrop. Actions that aren't
// currently available are omitted (the timer action while a timer runs, the
// gym action once the day has started).
export const CompleteDayFAB = ({ isFinishing }: Props) => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: timerEndData } = useTimerEnd(curUser?._id);
  const { isDayStarted } = useCurrentDay();

  const [open, setOpen] = useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  if (isFinishing) return null;

  const fabStyle = { backgroundColor: colors.primary, borderRadius: RADIUS.lg };

  const actions = [
    ...(!timerEndData?.timerEnd
      ? [
          {
            icon: "timer-outline",
            label: "Start Timer",
            onPress: () => setTimerDialogOpen(true),
          },
        ]
      : []),
    ...(!isDayStarted
      ? [
          {
            icon: "office-building",
            label: "Change Gym",
            onPress: () => setEditGymDialogOpen(true),
          },
        ]
      : []),
    {
      icon: "pencil",
      label: "Edit Exercises",
      onPress: () => setEditModalOpen(true),
    },
  ];

  return (
    <>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { zIndex: 9, opacity: progress, backgroundColor: colors.backdrop },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpen(false)}
        />
      </Animated.View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          // Nudged down by the title's line leading so the button's top lines
          // up with the exercise name's glyph (which sits a few px below its
          // box top) rather than with the box itself.
          top: FAB_TOP + SPACING.xs,
          right: FAB_EDGE,
          alignItems: "flex-end",
          gap: FAB_GAP,
          zIndex: 10,
        }}
      >
        <FAB
          icon={open ? "close" : "dots-vertical"}
          size="small"
          customSize={FAB_SIZE}
          color="white"
          style={fabStyle}
          onPress={() => setOpen((o) => !o)}
        />
        <Animated.View
          pointerEvents={open ? "box-none" : "none"}
          style={{
            alignItems: "flex-end",
            gap: FAB_GAP,
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          }}
        >
          {actions.map((action) => (
            <View
              key={action.icon}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.md,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "600",
                  fontSize: FONT.sm,
                }}
              >
                {action.label}
              </Text>
              <FAB
                icon={action.icon}
                size="small"
                customSize={FAB_SIZE}
                color="white"
                style={fabStyle}
                onPress={() => {
                  setOpen(false);
                  action.onPress();
                }}
              />
            </View>
          ))}
        </Animated.View>
      </View>
      <TimerSettingsDialog
        open={timerDialogOpen}
        onClose={() => setTimerDialogOpen(false)}
      />
      <EditGymDialog
        open={editGymDialogOpen}
        onClose={() => setEditGymDialogOpen(false)}
      />
      <EditExercisesModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  );
};

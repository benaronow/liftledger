import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useCurrentSession } from "@liftledger/api-client";
import { FAB_EDGE, FAB_GAP, FAB_SIZE, FAB_TOP } from "../../layout";
import {
  FAB,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../../theme";
import { useTimerCountdown } from "../../components/timer";
import { EditExercisesModal } from "./EditExercisesModal/EditExercisesModal";
import { EditGymDialog } from "./EditGymDialog";
import { TimerSettingsDialog } from "./TimerSettingsDialog";
import { env } from "../../config/env";

interface Props {
  isFinishing: boolean;
}

const DURATION = env.e2e ? 0 : 200;

export const CompleteSessionFAB = ({ isFinishing }: Props) => {
  const { colors } = useTheme();
  const { isActive: timerActive, timeString, clearTimer } = useTimerCountdown();
  const { isSessionStarted } = useCurrentSession();

  const [open, setOpen] = useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: DURATION,
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  if (isFinishing) return null;

  const fabStyle = { backgroundColor: colors.primary, borderRadius: RADIUS.lg };

  type FabAction = {
    icon: string;
    label: string;
    testID: string;
    onPress: () => void;
    backgroundColor?: string;
    disabled?: boolean;
  };

  const actions: FabAction[] = [
    timerActive
      ? {
          icon: "timer-off-outline",
          label: "Stop Timer",
          testID: "fab-stop-timer",
          backgroundColor: colors.error,
          onPress: clearTimer,
        }
      : {
          icon: "timer-outline",
          label: "Start Timer",
          testID: "fab-start-timer",
          onPress: () => setTimerDialogOpen(true),
        },
    {
      icon: "pencil",
      label: "Edit Exercises",
      testID: "fab-edit-exercises",
      onPress: () => setEditModalOpen(true),
    },
    {
      icon: "office-building",
      label: "Change Gym",
      testID: "fab-change-gym",
      onPress: () => setEditGymDialogOpen(true),
      disabled: isSessionStarted,
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
          top: FAB_TOP + SPACING.xs,
          right: FAB_EDGE,
          alignItems: "flex-end",
          gap: FAB_GAP,
          zIndex: 10,
        }}
      >
        {timerActive ? (
          <Surface
            elevation={3}
            style={{
              borderRadius: RADIUS.lg,
              backgroundColor: colors.primary,
            }}
          >
            <View style={{ borderRadius: RADIUS.lg, overflow: "hidden" }}>
              <TouchableRipple
                accessibilityLabel={open ? "Close actions" : "More actions"}
                testID="fab-more-actions"
                onPress={() => setOpen((o) => !o)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.xs,
                  height: FAB_SIZE,
                  paddingHorizontal: SPACING.md,
                }}
              >
                <>
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={20}
                    color="white"
                  />
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: FONT.base,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {timeString}
                  </Text>
                </>
              </TouchableRipple>
            </View>
          </Surface>
        ) : (
          <FAB
            icon={open ? "close" : "dots-vertical"}
            accessibilityLabel={open ? "Close actions" : "More actions"}
            testID="fab-more-actions"
            size="small"
            customSize={FAB_SIZE}
            color="white"
            style={fabStyle}
            onPress={() => setOpen((o) => !o)}
          />
        )}
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
            <FAB
              key={action.icon}
              icon={action.icon}
              accessibilityLabel={action.label}
              testID={action.testID}
              size="small"
              customSize={FAB_SIZE}
              color={action.disabled ? colors.onSurfaceDisabled : "white"}
              disabled={action.disabled}
              style={
                action.disabled
                  ? { ...fabStyle, backgroundColor: colors.surfaceDisabled }
                  : action.backgroundColor
                    ? { ...fabStyle, backgroundColor: action.backgroundColor }
                    : fabStyle
              }
              onPress={() => {
                setOpen(false);
                action.onPress();
              }}
            />
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

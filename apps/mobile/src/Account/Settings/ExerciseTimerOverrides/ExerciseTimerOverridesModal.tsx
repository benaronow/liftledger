import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMe, useTimerSettings } from "@liftledger/api-client";
import { IconButton, Portal, Surface, Text, useTheme } from "react-native-paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { LoadingCheckbox } from "../../../components/LoadingCheckbox";
import { Sheet } from "../../../components/Sheet";
import { TimePicker } from "../../../components/TimePicker";
import { useSnackbar } from "../../../providers/SnackbarProvider";
import { FONT, RADIUS, SPACING } from "../../../theme";

const DURATION = 250;

const formatTime = (totalSeconds: number) =>
  `${Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0")} : ${(totalSeconds % 60).toString().padStart(2, "0")}`;

interface Props {
  open: boolean;
  onClose: () => void;
}

// Page-sheet listing every exercise name with a per-exercise rest-timer
// override. Structured like CompleteSessionFAB/EditExercisesModal (Portal +
// animated bottom slide + Sheet, not a native pageSheet) so the edit dialog it
// opens from inside doesn't become a nested native modal.
export const ExerciseTimerOverridesModal = ({ open, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { defaultTime, exerciseOverrides, setExerciseOverride } =
    useTimerSettings();
  const { showSnackbar } = useSnackbar();
  const { height: screenHeight } = useWindowDimensions();

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  const [editingName, setEditingName] = useState<string>();
  const [draftTime, setDraftTime] = useState(defaultTime);
  const [saving, setSaving] = useState(false);
  const [togglingNames, setTogglingNames] = useState<Set<string>>(
    () => new Set(),
  );

  const exerciseNames = useMemo(
    () => [...(curUser?.exerciseNames ?? [])].sort(),
    [curUser?.exerciseNames],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [mounted, onClose]);

  const toggleOverride = async (name: string, currentlyOn: boolean) => {
    setTogglingNames((prev) => new Set(prev).add(name));
    try {
      await setExerciseOverride(name, currentlyOn ? undefined : defaultTime);
    } catch {
      showSnackbar("Failed to update override.", "error");
    } finally {
      setTogglingNames((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const startEdit = (name: string, current: number) => {
    setDraftTime(current);
    setEditingName(name);
  };

  const saveEdit = async () => {
    if (!editingName) return;
    setSaving(true);
    try {
      await setExerciseOverride(editingName, draftTime);
      setEditingName(undefined);
    } catch {
      showSnackbar("Failed to update override.", "error");
    } finally {
      setSaving(false);
    }
  };

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return mounted ? (
    <Portal>
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0, 0, 0, 0.5)", opacity: progress },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: colors.primaryContainer,
          borderTopLeftRadius: RADIUS.xl,
          borderTopRightRadius: RADIUS.xl,
          overflow: "hidden",
          transform: [{ translateY }],
        }}
      >
        <Sheet
          title="Exercise Overrides"
          actions={[{ label: "Done", onPress: onClose }]}
        >
          <FlatList
            style={{ flex: 1 }}
            data={exerciseNames}
            keyExtractor={(name) => name}
            extraData={[exerciseOverrides, togglingNames]}
            contentContainerStyle={{
              padding: SPACING.lg,
              paddingBottom: insets.bottom + SPACING.lg,
              gap: SPACING.md,
            }}
            renderItem={({ item: name }) => {
              const override = exerciseOverrides[name];
              const enabled = override !== undefined;
              return (
                <Surface
                  elevation={1}
                  style={{
                    width: "100%",
                    borderRadius: RADIUS.md,
                    backgroundColor: colors.background,
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 50,
                    paddingVertical: SPACING.sm,
                    paddingLeft: SPACING.xs,
                    paddingRight: SPACING.sm,
                    gap: SPACING.sm,
                  }}
                >
                  <LoadingCheckbox
                    status={enabled ? "checked" : "unchecked"}
                    loading={togglingNames.has(name)}
                    onPress={() => toggleOverride(name, enabled)}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      flex: 1,
                      color: colors.onSurface,
                      fontWeight: "700",
                      fontSize: FONT.base,
                    }}
                  >
                    {name}
                  </Text>
                  <View
                    style={{
                      // Match the size={18} edit IconButton's height (MD3:
                      // size + 2 * 8 padding = 34) so the two line up.
                      height: 34,
                      justifyContent: "center",
                      backgroundColor: colors.surfaceVariant,
                      paddingHorizontal: SPACING.sm,
                      borderRadius: RADIUS.sm,
                    }}
                  >
                    <Text
                      style={{
                        color: enabled
                          ? colors.onSurface
                          : colors.onSurfaceDisabled,
                        fontWeight: "700",
                        fontSize: FONT.base,
                      }}
                    >
                      {formatTime(enabled ? override : defaultTime)}
                    </Text>
                  </View>
                  <IconButton
                    mode="contained"
                    icon="pencil"
                    size={18}
                    containerColor={
                      enabled ? colors.primary : colors.surfaceDisabled
                    }
                    iconColor={
                      enabled ? colors.onPrimary : colors.onSurfaceDisabled
                    }
                    style={{ margin: 0, borderRadius: RADIUS.sm }}
                    disabled={!enabled}
                    onPress={() => startEdit(name, override)}
                  />
                </Surface>
              );
            }}
          />
        </Sheet>
      </Animated.View>
      <ConfirmationDialog
        open={editingName !== undefined}
        onClose={() => setEditingName(undefined)}
        title="Override Rest Time"
        action="Save"
        onConfirm={saveEdit}
        confirming={saving}
      >
        <TimePicker totalSeconds={draftTime} onChange={setDraftTime} />
      </ConfirmationDialog>
    </Portal>
  ) : null;
};

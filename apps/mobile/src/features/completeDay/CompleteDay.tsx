import { useCurrentDay } from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LogoSpinner } from "../../components/LogoSpinner";
import type { RootStackParamList } from "../../navigation/types";
import { SPACING } from "../../theme";
import { CompleteDayFooter } from "./CompleteDayFooter/CompleteDayFooter";
import { ExerciseList } from "./ExerciseList/ExerciseList";

export const CompleteDay = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { exercises, currentExIdx } = useCurrentDay();
  const [isEditing, setIsEditing] = useState(false);
  // While finishing, the saved block advances to the next day underneath us.
  // Masking the list with a spinner during the save hides that swap until we
  // navigate away — and lets the Finish button keep its loading state.
  const [isFinishing, setIsFinishing] = useState(false);

  // The screen owns the scroll: ExerciseList reports each card's y, and we
  // bring the current exercise into view on open (web parity) and when it
  // advances. `scrolledFor` stops us re-scrolling — and fighting the user — once
  // we've landed on a target.
  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<number, number>>({});
  const scrolledFor = useRef<number | null>(null);

  const scrollToCurrent = useCallback(() => {
    if (isEditing || currentExIdx < 0) return;
    if (scrolledFor.current === currentExIdx) return;
    const y = cardOffsets.current[currentExIdx];
    // Offsets may not be measured yet — onContentSizeChange/onCardLayout retry.
    if (y === undefined) return;
    scrolledFor.current = currentExIdx;
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - SPACING.lg),
      animated: true,
    });
  }, [isEditing, currentExIdx]);

  // Re-arm and attempt a scroll whenever the target changes (advancing through
  // exercises, leaving edit mode). On mount the offset isn't measured yet, so
  // this is a no-op and onContentSizeChange does the initial scroll instead.
  useEffect(() => {
    scrolledFor.current = null;
    scrollToCurrent();
  }, [scrollToCurrent]);

  const handleCardLayout = useCallback((idx: number, y: number) => {
    cardOffsets.current[idx] = y;
  }, []);

  // Content size fires repeatedly as cards lay out; debounce so the initial
  // scroll runs once against the *settled* (full-height) content — otherwise an
  // early fire scrolls against a too-short content, clamps, and latches.
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleContentSizeChange = useCallback(() => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(scrollToCurrent, 60);
  }, [scrollToCurrent]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  // No exercises means there's no current day to log (e.g. just finished) —
  // bounce back to the dashboard, as web did.
  useEffect(() => {
    if (!exercises.length) navigation.navigate("Tabs", { screen: "Dashboard" });
  }, [exercises, navigation]);

  if (!exercises.length) return <LogoSpinner />;

  return (
    <View style={styles.screen}>
      {isFinishing ? (
        <LogoSpinner />
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={handleContentSizeChange}
        >
          <ExerciseList
            exercises={exercises}
            isEditing={isEditing}
            onCardLayout={handleCardLayout}
          />
        </ScrollView>
      )}
      <CompleteDayFooter
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        isFinishing={isFinishing}
        setIsFinishing={setIsFinishing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    alignItems: "center",
  },
});

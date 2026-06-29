import { useCurrentSession } from "@liftledger/api-client";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { ExercisePage } from "./ExercisePage";

interface Props {
  pageIdx: number;
  onPageChange: (idx: number) => void;
}

export const ExercisePager = ({ pageIdx, onPageChange }: Props) => {
  const { exercises, currentExIdx } = useCurrentSession();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const isFirstSync = useRef(true);
  const initialOffset = useRef({ x: pageIdx * width, y: 0 }).current;
  const [swipeEnabled, setSwipeEnabled] = useState(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: pageIdx * width,
      animated: !isFirstSync.current,
    });
    isFirstSync.current = false;
  }, [pageIdx, width, exercises.length]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== pageIdx) onPageChange(idx);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      scrollEnabled={swipeEnabled}
      showsHorizontalScrollIndicator={false}
      contentOffset={initialOffset}
      onMomentumScrollEnd={onMomentumScrollEnd}
      style={{ flex: 1 }}
    >
      {exercises.map((exercise, index) => (
        <View key={index} style={{ width, height: "100%" }}>
          <ExercisePage
            exercise={exercise}
            isCurrentExercise={index === currentExIdx}
            onChartTouchStart={() => setSwipeEnabled(false)}
            onChartTouchEnd={() => setSwipeEnabled(true)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

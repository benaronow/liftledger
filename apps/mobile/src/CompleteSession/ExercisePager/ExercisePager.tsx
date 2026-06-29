import { useCurrentDay } from "@liftledger/api-client";
import type { Exercise } from "@liftledger/shared";
import { useEffect, useRef } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import { ExercisePage } from "./ExercisePage";

interface Props {
  pageIdx: number;
}

// One exercise per page. Paging is driven entirely by the PagerBar arrows
// (swiping is disabled — it fought the progress chart's pointer gesture), so
// this just slides the list to whatever page the screen says is active. Every
// exercise is browsable; pages ahead of the workout are read-only until it
// catches up (their sets can't be logged out of order).
export const ExercisePager = ({ pageIdx }: Props) => {
  const { exercises, currentExIdx } = useCurrentDay();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Exercise>>(null);

  // Slide to the active page when the arrows move it — and re-sync if the
  // page list shrinks under us (an add-on deleted from the edit modal).
  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: Math.min(pageIdx, exercises.length - 1),
      animated: true,
    });
  }, [pageIdx, exercises.length]);

  return (
    <FlatList
      ref={listRef}
      data={exercises}
      horizontal
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, idx) => String(idx)}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
      initialScrollIndex={pageIdx}
      renderItem={({ item, index }) => (
        <ExercisePage
          exercise={item}
          isCurrentExercise={index === currentExIdx}
          width={width}
        />
      )}
    />
  );
};

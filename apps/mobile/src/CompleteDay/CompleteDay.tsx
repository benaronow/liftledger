import { useCurrentDay } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { RootStackParamList } from "../RootNavigator/types";
import { useTheme } from "../paper";
import { CompleteDayFAB } from "./CompleteDayFAB/CompleteDayFAB";
import { ExercisePager } from "./ExercisePager/ExercisePager";
import { PagerBar } from "./ExercisePager/PagerBar";
import { FinishDayDialog } from "./FinishDayDialog";

export const CompleteDay = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { exercises, currentExIdx } = useCurrentDay();
  const { colors } = useTheme();
  // While finishing, the saved program advances to the next day underneath us.
  // Masking the pager with a spinner during the save hides that swap until we
  // navigate away.
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  // Land on the exercise that's up next (web parity); -1 means the day is
  // already complete, so open on the last exercise instead.
  const [pageIdx, setPageIdx] = useState(() =>
    currentExIdx === -1 ? Math.max(0, exercises.length - 1) : currentExIdx,
  );

  // No exercises means there's no current day to log (e.g. just finished) —
  // bounce back to the dashboard, as web did.
  useEffect(() => {
    if (!exercises.length)
      navigation.navigate("Tabs", { screen: "Dashboard" }, { pop: true });
  }, [exercises, navigation]);

  if (!exercises.length) return <LogoSpinner />;

  // Deleting the last add-on from the edit modal can leave the active page
  // past the end — snap back to the last exercise.
  const clampedPageIdx = Math.min(pageIdx, exercises.length - 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isFinishing ? (
        <LogoSpinner />
      ) : (
        <>
          <ExercisePager pageIdx={clampedPageIdx} />
          <PagerBar
            pageIdx={clampedPageIdx}
            onPageChange={setPageIdx}
            onFinish={() => setFinishDialogOpen(true)}
          />
        </>
      )}
      <CompleteDayFAB isFinishing={isFinishing} />
      <FinishDayDialog
        open={finishDialogOpen}
        onClose={() => setFinishDialogOpen(false)}
        finishing={isFinishing}
        setFinishing={setIsFinishing}
      />
    </View>
  );
};

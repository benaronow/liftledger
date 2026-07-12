import { useCurrentSession } from "@liftledger/api-client";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { TouchableRipple, useTheme } from "react-native-paper";
import { RADIUS } from "../theme";
import { LogoSpinner } from "../components/LogoSpinner";
import type { RootStackParamList } from "../RootNavigator/types";
import { useThemePreference } from "../providers/ThemeProvider";
import { CompleteSessionFAB } from "./CompleteSessionFAB/CompleteSessionFAB";
import { ExercisePager } from "./ExercisePager/ExercisePager";
import { PagerBar } from "./ExercisePager/PagerBar";
import { FinishSessionDialog } from "./FinishSessionDialog";
import { SkipDayDialog } from "./SkipDayDialog";

export const CompleteSession = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { exercises, currentExIdx, isSessionComplete, isLoading } =
    useCurrentSession();
  const { colors } = useTheme();
  const { scheme } = useThemePreference();
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);

  const canSkip = !isSessionComplete && !isFinishing;
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: canSkip
        ? () => (
            <TouchableRipple
              accessibilityLabel="Skip the rest of the day"
              onPress={() => setSkipDialogOpen(true)}
              style={{ borderRadius: RADIUS.md, overflow: "hidden" }}
            >
              <MaterialCommunityIcons
                name="fast-forward"
                size={24}
                color={scheme === "dark" ? "white" : "black"}
              />
            </TouchableRipple>
          )
        : undefined,
    });
  }, [navigation, canSkip, scheme]);

  const [pageIdx, setPageIdx] = useState(() =>
    currentExIdx === -1 ? Math.max(0, exercises.length - 1) : currentExIdx,
  );

  useEffect(() => {
    // Only bounce back once the program has actually loaded and the session is
    // genuinely empty — otherwise a cold launch (program still fetching) would
    // redirect away before the exercises arrive.
    if (!isLoading && !exercises.length)
      navigation.navigate("Tabs", { screen: "Dashboard" }, { pop: true });
  }, [isLoading, exercises, navigation]);

  if (isLoading || !exercises.length) return <LogoSpinner />;

  const clampedPageIdx = Math.min(pageIdx, exercises.length - 1);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isFinishing ? (
        <LogoSpinner />
      ) : (
        <>
          <ExercisePager pageIdx={clampedPageIdx} onPageChange={setPageIdx} />
          <PagerBar
            pageIdx={clampedPageIdx}
            onPageChange={setPageIdx}
            onFinish={() => setFinishDialogOpen(true)}
          />
        </>
      )}
      <CompleteSessionFAB isFinishing={isFinishing} />
      <FinishSessionDialog
        open={finishDialogOpen}
        onClose={() => setFinishDialogOpen(false)}
        finishing={isFinishing}
        setFinishing={setIsFinishing}
      />
      <SkipDayDialog
        open={skipDialogOpen}
        onClose={() => setSkipDialogOpen(false)}
        finishing={isFinishing}
        setFinishing={setIsFinishing}
      />
    </View>
  );
};

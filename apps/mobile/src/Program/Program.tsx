import {
  useCompletedExercises,
  useProgram,
  useMe,
} from "@liftledger/api-client";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogoSpinner } from "../components/LogoSpinner";
import { floatingTabBarClearance } from "../RootNavigator/TabNavigator/FloatingTabBar";
import type { TabParamList } from "../RootNavigator/types";
import { useTheme } from "../paper";
import { ProgramFooter } from "./ProgramFooter";
import { EditorView } from "./EditorView";
import { EMPTY_PROGRAM } from "./emptyProgram";
import { TemplateProvider } from "./TemplateProvider";
import { templateFromProgram } from "./templateFromProgram";

export const Program = () => {
  const { params } = useRoute<RouteProp<TabParamList, "EditProgram">>();
  const duplicateFromId = params?.duplicateFrom;

  const { data: curUser } = useMe();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isLoading: curProgramLoading, data: curProgram } = useProgram(
    curUser?._id,
    curUser?.curProgram,
  );
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);

  const sourceProgram = useMemo(() => {
    if (!duplicateFromId || !curUser?.programs) return null;
    return curUser.programs.find((b) => b._id === duplicateFromId) ?? null;
  }, [duplicateFromId, curUser?.programs]);

  if (!curUser) return <LogoSpinner />;

  if (duplicateFromId) {
    if (!sourceProgram || completedExercisesLoading || !completedExercises)
      return <LogoSpinner />;
  } else if (curProgramLoading) {
    return <LogoSpinner />;
  }

  const initialTemplate = duplicateFromId
    ? templateFromProgram(sourceProgram!, completedExercises!)
    : (curProgram ?? EMPTY_PROGRAM);
  const initialWeekIdx = duplicateFromId ? 0 : (curProgram?.curWeekIdx ?? 0);

  return (
    // Re-key on the active program id + duplicate source so the editor
    // re-initializes when the program changes (after save/quit) or a new
    // duplicate arrives — but persists across plain tab switches.
    <TemplateProvider
      key={`${curUser.curProgram ?? "none"}:${duplicateFromId ?? "default"}`}
      initialTemplate={initialTemplate}
      initialWeekIdx={initialWeekIdx}
    >
      {/* Lift the editor + its action footer above the floating tab pill so
          the pill never covers the Save/Quit buttons. */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingBottom: floatingTabBarClearance(insets.bottom),
        }}
      >
        <EditorView />
        <ProgramFooter />
      </View>
    </TemplateProvider>
  );
};

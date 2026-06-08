import {
  useCompletedExercises,
  useProgram,
  useMe,
} from "@liftledger/api-client";
import {
  RouteProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabParamList } from "../RootNavigator/types";
import { useTheme } from "../paper";
import { ProgramFAB } from "./ProgramFAB";
import { EditorView } from "./EditorView";
import { EMPTY_PROGRAM } from "./emptyProgram";
import { ProgramTransitionProvider } from "./ProgramTransition";
import { TemplateProvider } from "./TemplateProvider";
import { templateFromProgram } from "./templateFromProgram";

export const Program = () => {
  const { params } = useRoute<RouteProp<TabParamList, "Program">>();
  const navigation = useNavigation();
  const duplicateFromId = params?.duplicateFrom;

  // Covers the editor with the spinner from "Save"/"Quit" confirmation until we
  // navigate away, hiding the frame where the editor re-renders with the saved
  // program (quit FAB appears) or the emptied template. Reset on blur — by then
  // the tab has switched, so the screen is detached and the reset can't flash.
  const [transitioning, setTransitioning] = useState(false);
  useEffect(
    () => navigation.addListener("blur", () => setTransitioning(false)),
    [navigation],
  );

  const { data: curUser } = useMe();
  const { colors } = useTheme();
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
    <ProgramTransitionProvider value={{ transitioning, setTransitioning }}>
      <View style={{ flex: 1 }}>
        <TemplateProvider
          key={`${curUser.curProgram ?? "none"}:${duplicateFromId ?? "default"}`}
          initialTemplate={initialTemplate}
          initialWeekIdx={initialWeekIdx}
        >
          {/* Full-screen editor: content scrolls behind the floating tab pill
              (the tab navigator's bottom blur eases that transition) and the
              pinned FABs ride on top in the corner. */}
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            <EditorView />
            <ProgramFAB />
          </View>
        </TemplateProvider>
        {transitioning && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
            <LogoSpinner />
          </View>
        )}
      </View>
    </ProgramTransitionProvider>
  );
};

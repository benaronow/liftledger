import {
  useCompletedExercises,
  useProgram,
  useMe,
} from "@liftledger/api-client";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabParamList } from "../RootNavigator/types";
import { useTheme } from "react-native-paper";
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

  const editingActiveProgram = !!curUser.curProgram;

  if (editingActiveProgram && (curProgramLoading || !curProgram)) {
    return <LogoSpinner />;
  } else if (
    duplicateFromId &&
    (!sourceProgram || completedExercisesLoading || !completedExercises)
  ) {
    return <LogoSpinner />;
  }

  const initialTemplate = editingActiveProgram
    ? curProgram!
    : duplicateFromId
      ? templateFromProgram(sourceProgram!, completedExercises!)
      : EMPTY_PROGRAM;
  const initialWeekIdx = editingActiveProgram
    ? (curProgram!.curWeekIdx ?? 0)
    : 0;

  return (
    <ProgramTransitionProvider value={{ transitioning, setTransitioning }}>
      <View style={{ flex: 1 }}>
        <TemplateProvider
          key={`${curUser.curProgram ?? "none"}:${duplicateFromId ?? "default"}`}
          initialTemplate={initialTemplate}
          initialWeekIdx={initialWeekIdx}
        >
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

import {
  useCompletedExercises,
  useHistoricalProgram,
  useProgram,
  useMe,
} from "@liftledger/api-client";
import { RouteProp, useRoute } from "@react-navigation/native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabParamList } from "../RootNavigator/types";
import { ProgramNavigator } from "./ProgramNavigator/ProgramNavigator";
import { emptyProgram } from "./emptyProgram";
import { TemplateProvider } from "./TemplateProvider";
import { templateFromProgram } from "./templateFromProgram";

export const Program = () => {
  const { params } = useRoute<RouteProp<TabParamList, "Program">>();
  const duplicateFromId = params?.duplicateFrom;
  const { data: curUser } = useMe();
  const { isLoading: curProgramLoading, data: curProgram } = useProgram();
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises();
  const { data: sourceProgram } = useHistoricalProgram(duplicateFromId);

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
      : emptyProgram(curUser.options.defaultUnit);
  const initialRotationIdx = editingActiveProgram
    ? (curProgram!.curRotationIdx ?? 0)
    : 0;

  return (
    <TemplateProvider
      key={`${curUser.curProgram ?? "none"}:${duplicateFromId ?? "default"}`}
      initialTemplate={initialTemplate}
      initialRotationIdx={initialRotationIdx}
    >
      <ProgramNavigator />
    </TemplateProvider>
  );
};

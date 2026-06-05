import { useCompletedExercises, useBlock, useMe } from "@liftledger/api-client";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { View } from "react-native";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabParamList } from "../navigation/types";
import { useTheme } from "../providers/ThemeProvider";
import { EditBlockFooter } from "./EditBlockFooter/EditBlockFooter";
import { EditorView } from "./EditorView";
import { EMPTY_BLOCK } from "./emptyBlock";
import { TemplateProvider } from "./TemplateProvider";
import { templateFromBlock } from "./templateFromBlock";

export const EditBlock = () => {
  const { params } = useRoute<RouteProp<TabParamList, "EditBlock">>();
  const duplicateFromId = params?.duplicateFrom;

  const { data: curUser } = useMe();
  const { colors } = useTheme();
  const { isLoading: curBlockLoading, data: curBlock } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const { data: completedExercises, isLoading: completedExercisesLoading } =
    useCompletedExercises(curUser?._id);

  const sourceBlock = useMemo(() => {
    if (!duplicateFromId || !curUser?.blocks) return null;
    return curUser.blocks.find((b) => b._id === duplicateFromId) ?? null;
  }, [duplicateFromId, curUser?.blocks]);

  if (!curUser) return <LogoSpinner />;

  if (duplicateFromId) {
    if (!sourceBlock || completedExercisesLoading || !completedExercises)
      return <LogoSpinner />;
  } else if (curBlockLoading) {
    return <LogoSpinner />;
  }

  const initialTemplate = duplicateFromId
    ? templateFromBlock(sourceBlock!, completedExercises!)
    : (curBlock ?? EMPTY_BLOCK);
  const initialWeekIdx = duplicateFromId ? 0 : (curBlock?.curWeekIdx ?? 0);

  return (
    // Re-key on the active block id + duplicate source so the editor
    // re-initializes when the block changes (after save/quit) or a new
    // duplicate arrives — but persists across plain tab switches.
    <TemplateProvider
      key={`${curUser.curBlock ?? "none"}:${duplicateFromId ?? "default"}`}
      initialTemplate={initialTemplate}
      initialWeekIdx={initialWeekIdx}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EditorView />
        <EditBlockFooter />
      </View>
    </TemplateProvider>
  );
};

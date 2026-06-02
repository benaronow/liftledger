import {
  useCompletedExercises,
  useBlock,
  useMe,
} from "@liftledger/api-client";
import { COLORS } from "@liftledger/shared";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LogoSpinner } from "../../components/LogoSpinner";
import type { TabParamList } from "../../navigation/types";
import { SPACING } from "../../theme";
import { EditBlockFooter } from "./EditBlockFooter";
import { EditorView } from "./EditorView";
import { EMPTY_BLOCK } from "./emptyBlock";
import { TemplateProvider } from "./TemplateProvider";
import { templateFromBlock } from "./templateFromBlock";

export const EditBlock = () => {
  const { params } = useRoute<RouteProp<TabParamList, "EditBlock">>();
  const duplicateFromId = params?.duplicateFrom;

  const { data: curUser } = useMe();
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
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          // Scroll a focused field (block name, day name, weeks) above the
          // keyboard instead of letting the keyboard cover the lower form.
          automaticallyAdjustKeyboardInsets
        >
          <EditorView />
        </ScrollView>
        <EditBlockFooter />
      </View>
    </TemplateProvider>
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

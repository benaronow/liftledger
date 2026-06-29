import { useProgram, useMe } from "@liftledger/api-client";
import { useState } from "react";
import { View } from "react-native";
import { FAB, useTheme } from "react-native-paper";
import { RADIUS, SPACING } from "../../theme";
import { FAB_EDGE, FAB_GAP, FAB_SIZE, FAB_TOP } from "../../layout";
import { useTemplate } from "../TemplateProvider";
import { hasAnyError } from "../validateTemplate";
import { QuitProgramDialog } from "./QuitProgramDialog";
import { SaveProgramDialog } from "./SaveProgramDialog";

export const ProgramFAB = () => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { editingSessionIdx, setEditingSessionIdx, templateErrors } = useTemplate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  const isEditingSession = editingSessionIdx !== -1;
  const saveDisabled = !isEditingSession && hasAnyError(templateErrors);

  return (
    <>
      <View
        style={{
          position: "absolute",
          // Nudged down by the title's line leading so the buttons' tops line
          // up with the editor title's glyph (matching CompleteSession's FAB).
          top: FAB_TOP + SPACING.xs,
          right: FAB_EDGE,
          flexDirection: "row",
          gap: FAB_GAP,
          zIndex: 10,
        }}
      >
        {!isEditingSession && curProgram && (
          <FAB
            key="stop"
            icon="stop-circle"
            size="small"
            customSize={FAB_SIZE}
            color="white"
            style={{ backgroundColor: colors.error, borderRadius: RADIUS.lg }}
            onPress={() => setQuitDialogOpen(true)}
          />
        )}
        {/* A single stable FAB whose icon swaps between save and back. Keeping
            it mounted (rather than swapping between two conditionally-rendered
            FABs) lets Paper's CrossFadeIcon spin the icon in BOTH directions. */}
        <FAB
          key="primary"
          icon={isEditingSession ? "arrow-left" : "content-save"}
          size="small"
          customSize={FAB_SIZE}
          color="white"
          disabled={saveDisabled}
          style={{
            backgroundColor: saveDisabled
              ? colors.surfaceDisabled
              : colors.primary,
            borderRadius: RADIUS.lg,
          }}
          onPress={() =>
            isEditingSession ? setEditingSessionIdx(-1) : setSaveDialogOpen(true)
          }
        />
      </View>
      <SaveProgramDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
      />
      <QuitProgramDialog
        open={quitDialogOpen}
        onClose={() => setQuitDialogOpen(false)}
      />
    </>
  );
};

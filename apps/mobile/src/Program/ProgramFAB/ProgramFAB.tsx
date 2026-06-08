import { useProgram, useMe } from "@liftledger/api-client";
import { useState } from "react";
import { View } from "react-native";
import { FAB, useTheme } from "../../paper";
import { RADIUS } from "../../theme";
import { FAB_EDGE, FAB_GAP, FAB_SIZE, FAB_TOP } from "../layout";
import { useTemplate } from "../TemplateProvider";
import { QuitProgramDialog } from "./QuitProgramDialog";
import { SaveProgramDialog } from "./SaveProgramDialog";

export const ProgramFAB = () => {
  const { colors } = useTheme();
  const { data: curUser } = useMe();
  const { data: curProgram } = useProgram(curUser?._id, curUser?.curProgram);
  const { editingDayIdx, setEditingDayIdx, templateErrors } = useTemplate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [quitDialogOpen, setQuitDialogOpen] = useState(false);

  const isEditingDay = editingDayIdx !== -1;

  return (
    <>
      <View
        style={{
          position: "absolute",
          top: FAB_TOP,
          right: FAB_EDGE,
          flexDirection: "row",
          gap: FAB_GAP,
          zIndex: 10,
        }}
      >
        {!isEditingDay && curProgram && (
          <FAB
            key="stop"
            icon="stop-circle"
            size="small"
            customSize={FAB_SIZE}
            color="white"
            style={{ backgroundColor: colors.danger, borderRadius: RADIUS.lg }}
            onPress={() => setQuitDialogOpen(true)}
          />
        )}
        {/* A single stable FAB whose icon swaps between save and back. Keeping
            it mounted (rather than swapping between two conditionally-rendered
            FABs) lets Paper's CrossFadeIcon spin the icon in BOTH directions. */}
        <FAB
          key="primary"
          icon={isEditingDay ? "arrow-left" : "content-save"}
          size="small"
          customSize={FAB_SIZE}
          color="white"
          disabled={!isEditingDay && templateErrors.length > 0}
          style={{ backgroundColor: colors.primary, borderRadius: RADIUS.lg }}
          onPress={() =>
            isEditingDay ? setEditingDayIdx(-1) : setSaveDialogOpen(true)
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

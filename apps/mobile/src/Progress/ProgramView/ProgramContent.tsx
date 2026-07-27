import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProgramEdit } from "./ProgramEditProvider";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { floatingTabBarClearance } from "../../RootNavigator/TabNavigator/FloatingTabBar";
import { ProgressTitle } from "../ProgressTitle";
import { ProgressActions } from "../ProgressTopBar";
import { SPACING } from "../../theme";
import { AppTextInput } from "../../components/inputs";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { useSnackbar } from "../../providers/SnackbarProvider";
import { RotationRow } from "./RotationRow";

interface Props {
  showName: boolean;
  title: string;
  showBack?: boolean;
}

export const ProgramContent = ({ showName, title, showBack }: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { program, setProgram, saving, save } = useProgramEdit();
  const { showSnackbar } = useSnackbar();

  const [expandedRotation, setExpandedRotation] = useState<number | null>(null);
  useFocusEffect(useCallback(() => () => setExpandedRotation(null), []));

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleSave = async () => {
    try {
      await save();
      setSaveDialogOpen(false);
    } catch {
      showSnackbar("Error saving program. Please try again.", "error");
    }
  };

  const reserveButtons = (showBack ? 1 : 0) + 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <ProgressTitle title={title} reserveButtons={reserveButtons} />
            <View
              style={{
                paddingHorizontal: SPACING.lg,
                paddingTop: SPACING.md,
                paddingBottom: floatingTabBarClearance(
                  insets.bottom + SPACING.xxl,
                ),
                gap: SPACING.md,
              }}
            >
              {showName ? (
                <AppTextInput
                  label="Program name"
                  value={program.name}
                  onChangeText={(name) =>
                    setProgram((prev) => ({ ...prev, name }))
                  }
                />
              ) : null}
              {program.rotations.map((rotation, idx) => (
                <RotationRow
                  key={idx}
                  rotation={rotation}
                  index={idx}
                  expanded={expandedRotation === idx}
                  onToggle={() =>
                    setExpandedRotation((prev) => (prev === idx ? null : idx))
                  }
                  onChange={(next) =>
                    setProgram((prev) => ({
                      ...prev,
                      rotations: prev.rotations.toSpliced(idx, 1, next),
                    }))
                  }
                />
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
      <ProgressActions
        showBack={showBack}
        save={{ saving, onPress: () => setSaveDialogOpen(true) }}
      />
      <ConfirmationDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        title="Save Program"
        onConfirm={handleSave}
        confirming={saving}
        action="Save"
        description="Are you sure you want to save your changes to this program?"
        emphasis="This will overwrite the saved program history."
      />
    </View>
  );
};

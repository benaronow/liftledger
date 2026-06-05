import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { Text, View } from "react-native";
import { ActionDialog, DialogAction } from "../../../components/ActionDialog";
import { FONT, SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingExerciseIdx: number | undefined;
  onClose: () => void;
}

export const DeleteExerciseDialog = ({
  deletingExerciseIdx,
  onClose,
}: Props) => {
  const { templateBlock, setTemplateBlock, editingWeekIdx, editingDayIdx } =
    useTemplate();

  const handleRemoveExercise = () => {
    if (templateBlock.weeks[editingWeekIdx][editingDayIdx].exercises.length > 1)
      setTemplateBlock({
        ...templateBlock,
        weeks: templateBlock.weeks.map((week, wIdx) =>
          wIdx === editingWeekIdx
            ? week.map((day, dIdx) =>
                dIdx === editingDayIdx && deletingExerciseIdx !== undefined
                  ? {
                      ...day,
                      exercises: day.exercises.toSpliced(
                        deletingExerciseIdx,
                        1,
                      ),
                    }
                  : day,
              )
            : week,
        ),
      });
    onClose();
  };

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.danger} />,
      onPress: onClose,
      variant: "dangerInverted",
    },
    {
      icon: <Ionicons name="trash" size={24} color="white" />,
      onPress: handleRemoveExercise,
      variant: "danger",
    },
  ];

  if (deletingExerciseIdx === undefined) return null;

  return (
    <ActionDialog
      open={deletingExerciseIdx !== undefined}
      onClose={onClose}
      title="Delete Exercise"
      actions={actions}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: "white", fontSize: FONT.base }}>
          Are you sure you want to delete this exercise?
        </Text>
        <Text
          style={{ color: "white", fontSize: FONT.base, fontWeight: "700" }}
        >
          This action cannot be undone.
        </Text>
      </View>
    </ActionDialog>
  );
};

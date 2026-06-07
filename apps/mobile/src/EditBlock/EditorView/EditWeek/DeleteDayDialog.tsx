import { View } from "react-native";
import { Text, useTheme } from "../../../paper";
import { ConfirmationDialog } from "../../../components/ConfirmationDialog";
import { FONT, SPACING } from "../../../theme";
import { useTemplate } from "../../TemplateProvider";

interface Props {
  deletingDayIdx: number | undefined;
  onClose: () => void;
}

export const DeleteDayDialog = ({ deletingDayIdx, onClose }: Props) => {
  const { colors } = useTheme();
  const { templateBlock, setTemplateBlock, editingWeekIdx } = useTemplate();

  const handleRemoveDay = () => {
    setTemplateBlock({
      ...templateBlock,
      weeks: templateBlock.weeks.map((week, idx) =>
        idx === editingWeekIdx && deletingDayIdx !== undefined
          ? week.toSpliced(deletingDayIdx, 1)
          : week,
      ),
    });
    onClose();
  };

  if (deletingDayIdx === undefined) return null;

  return (
    <ConfirmationDialog
      open={deletingDayIdx !== undefined}
      onClose={onClose}
      title="Delete Day"
      onConfirm={handleRemoveDay}
    >
      <View style={{ width: "100%", gap: SPACING.md }}>
        <Text style={{ color: colors.text, fontSize: FONT.base }}>
          Are you sure you want to delete this day?
        </Text>
        <Text
          style={{ color: colors.text, fontSize: FONT.base, fontWeight: "700" }}
        >
          This action cannot be undone.
        </Text>
      </View>
    </ConfirmationDialog>
  );
};

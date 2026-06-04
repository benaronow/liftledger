import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { StyleSheet, Text, View } from "react-native";
import { ActionDialog, DialogAction } from "../../../components/ActionDialog";
import { FONT, SPACING } from "../../../theme";
import { useTemplate } from "../TemplateProvider";

interface Props {
  deletingDayIdx: number | undefined;
  onClose: () => void;
}

export const DeleteDayDialog = ({ deletingDayIdx, onClose }: Props) => {
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

  const actions: DialogAction[] = [
    {
      icon: <Ionicons name="arrow-back" size={26} color={COLORS.danger} />,
      onPress: onClose,
      variant: "dangerInverted",
    },
    {
      icon: <Ionicons name="trash" size={24} color="white" />,
      onPress: handleRemoveDay,
      variant: "danger",
    },
  ];

  if (deletingDayIdx === undefined) return null;

  return (
    <ActionDialog
      open={deletingDayIdx !== undefined}
      onClose={onClose}
      title="Delete Day"
      actions={actions}
    >
      <View style={styles.body}>
        <Text style={styles.text}>
          Are you sure you want to delete this day?
        </Text>
        <Text style={styles.bold}>This action cannot be undone.</Text>
      </View>
    </ActionDialog>
  );
};

const styles = StyleSheet.create({
  body: { width: "100%", gap: SPACING.md },
  text: { color: "white", fontSize: FONT.base },
  bold: { color: "white", fontSize: FONT.base, fontWeight: "700" },
});

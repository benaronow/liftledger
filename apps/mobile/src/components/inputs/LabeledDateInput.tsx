import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@liftledger/shared";
import dayjs, { Dayjs } from "dayjs";
import { ReactNode, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FONT, RADIUS, SPACING } from "../../theme";
import { ActionButton } from "../ActionButton";
import { LabeledInputContainer } from "./LabeledInputContainer";

interface Props {
  label?: string;
  error?: string;
  value?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  disabled?: boolean;
  height?: number;
  renderEnd?: () => ReactNode;
}

// Native replacement for web's react-datepicker. The field shows the selected
// date; tapping opens the platform picker (Android: dialog; iOS: spinner in a
// confirm sheet, since iOS pickers stay mounted).
export const LabeledDateInput = ({
  label,
  error,
  value,
  onChange,
  disabled,
  height,
  renderEnd,
}: Props) => {
  const [open, setOpen] = useState(false);
  const selected = value && value.isValid() ? value.toDate() : new Date();

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <Pressable
        style={[
          styles.field,
          {
            height: height ?? 35,
            backgroundColor: disabled ? COLORS.textDisabled : "white",
            ...(renderEnd
              ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
              : null),
          },
        ]}
        onPress={openPicker}
        disabled={disabled}
      >
        <Text style={styles.value}>
          {value && value.isValid() ? value.format("MM/DD/YYYY") : ""}
        </Text>
      </Pressable>

      {open &&
        (Platform.OS === "ios" ? (
          <Modal visible transparent animationType="fade">
            <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
              <Pressable style={styles.sheet} onPress={() => {}}>
                <DateTimePicker
                  value={selected}
                  mode="date"
                  display="spinner"
                  onChange={(_, date) => date && onChange?.(dayjs(date))}
                />
                <View style={styles.sheetActions}>
                  <ActionButton
                    label="Done"
                    icon={null}
                    onPress={() => setOpen(false)}
                  />
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        ) : (
          <DateTimePicker
            value={selected}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setOpen(false);
              if (date) onChange?.(dayjs(date));
            }}
          />
        ))}
    </LabeledInputContainer>
  );
};

const styles = StyleSheet.create({
  field: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  value: { fontSize: FONT.base, color: "black" },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: COLORS.container,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  sheetActions: { paddingHorizontal: SPACING.md },
});

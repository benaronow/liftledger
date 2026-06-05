import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs, { Dayjs } from "dayjs";
import { ReactNode, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../providers/ThemeProvider";
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
  const { colors } = useTheme();

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
  };

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <Pressable
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: SPACING.sm,
          borderRadius: RADIUS.md,
          height: height ?? 35,
          backgroundColor: disabled ? colors.textDisabled : "white",
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        }}
        onPress={openPicker}
        disabled={disabled}
      >
        <Text style={{ fontSize: FONT.base, color: "black" }}>
          {value && value.isValid() ? value.format("MM/DD/YYYY") : ""}
        </Text>
      </Pressable>

      {open &&
        (Platform.OS === "ios" ? (
          <Modal visible transparent animationType="fade">
            <Pressable
              style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
              onPress={() => setOpen(false)}
            >
              <Pressable
                style={{
                  borderTopLeftRadius: RADIUS.xl,
                  borderTopRightRadius: RADIUS.xl,
                  padding: SPACING.md,
                  backgroundColor: colors.container,
                }}
                onPress={() => {}}
              >
                <DateTimePicker
                  value={selected}
                  mode="date"
                  display="spinner"
                  onChange={(_, date) => date && onChange?.(dayjs(date))}
                />
                <View style={{ paddingHorizontal: SPACING.md }}>
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


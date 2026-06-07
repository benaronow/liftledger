import dayjs, { Dayjs } from "dayjs";
import { ReactNode, useState } from "react";
import { View } from "react-native";
import { Text, TouchableRipple, useTheme } from "../../paper";
import { DatePickerModal } from "react-native-paper-dates";
import { FONT, RADIUS, SPACING } from "../../theme";
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
// date; tapping opens react-native-paper-dates' calendar modal.
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
  const selected = value && value.isValid() ? value.toDate() : undefined;
  const { colors } = useTheme();

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <TouchableRipple
        style={{
          flex: 1,
          justifyContent: "center",
          borderRadius: RADIUS.md,
          height: height ?? 35,
          backgroundColor: disabled ? colors.textDisabled : "white",
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        }}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <View style={{ paddingHorizontal: SPACING.sm }}>
          <Text style={{ fontSize: FONT.base, color: "black" }}>
            {value && value.isValid() ? value.format("MM/DD/YYYY") : ""}
          </Text>
        </View>
      </TouchableRipple>

      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={() => setOpen(false)}
        date={selected}
        onConfirm={({ date }) => {
          setOpen(false);
          onChange?.(date ? dayjs(date) : null);
        }}
      />
    </LabeledInputContainer>
  );
};

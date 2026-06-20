import { ReactNode } from "react";
import { KeyboardTypeOptions } from "react-native";
import { TextInput, useTheme } from "../../paper";
import { FONT, RADIUS } from "../../theme";
import { LabeledInputContainer } from "./LabeledInputContainer";

interface Props {
  label?: string;
  error?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  height?: number;
  renderEnd?: () => ReactNode;
  onBlur?: () => void;
}

// The label/error chrome lives in LabeledInputContainer, so the Paper TextInput
// runs label-less. Kept as a compact white field (parity with the pre-Paper UI);
// Paper handles the focus/error outline coloring.
export const LabeledTextInput = ({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  editable = true,
  secureTextEntry,
  keyboardType,
  height,
  renderEnd,
  onBlur,
}: Props) => {
  const { colors } = useTheme();
  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <TextInput
        mode="outlined"
        dense
        style={{
          flex: 1,
          height: height ?? 35,
          fontSize: FONT.base,
          backgroundColor: editable ? "white" : colors.textDisabled,
        }}
        contentStyle={{ paddingVertical: 0 }}
        outlineStyle={{
          borderRadius: RADIUS.md,
          borderWidth: 2,
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        }}
        textColor="black"
        outlineColor={colors.textDisabled}
        activeOutlineColor={colors.primary}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        selectionColor={colors.primary}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        editable={editable}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </LabeledInputContainer>
  );
};

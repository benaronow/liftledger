import { COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import { KeyboardTypeOptions, StyleSheet, TextInput } from "react-native";
import { FONT, RADIUS, SPACING } from "../../theme";
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
}: Props) => (
  <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
    <TextInput
      style={[
        styles.input,
        {
          height: height ?? 35,
          backgroundColor: editable ? "white" : COLORS.textDisabled,
          // Square off the trailing edge when an adjacent end-element is shown.
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor={COLORS.textDisabled}
      editable={editable}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </LabeledInputContainer>
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: FONT.base,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    color: "black",
  },
});

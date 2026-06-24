import { ComponentProps, useEffect, useState } from "react";
import { AppTextInput } from "./AppTextInput";

type Props = Omit<
  ComponentProps<typeof AppTextInput>,
  "value" | "onChangeText" | "keyboardType"
> & {
  value: number | null;
  onChangeValue: (value: number | null) => void;
  decimal?: boolean;
};

const format = (value: number | null) => (value == null ? "" : String(value));

export const NumberInput = ({
  value,
  onChangeValue,
  decimal,
  onFocus,
  onBlur,
  ...rest
}: Props) => {
  const [raw, setRaw] = useState(format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setRaw(format(value));
  }, [value, focused]);

  const handleChangeText = (text: string) => {
    setRaw(text);
    if (text.trim() === "") return onChangeValue(null);
    const n = decimal ? parseFloat(text) : parseInt(text, 10);
    onChangeValue(Number.isNaN(n) ? null : n);
  };

  return (
    <AppTextInput
      {...rest}
      value={raw}
      keyboardType={decimal ? "decimal-pad" : "number-pad"}
      onChangeText={handleChangeText}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />
  );
};

import { createContext, useContext, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppTextInput } from "./inputs";
import { SelectSheet } from "./SelectSheet";

export const SelectModalContext = createContext<{
  register: () => () => void;
} | null>(null);

interface Props {
  label?: string;
  error?: string;
  value: string;
  options: string[];
  unavailableOptions?: string[];
  onSelect: (value: string) => void;
  onAddCustom?: (value: string) => Promise<void>;
  canAddCustom?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const SearchableSelect = ({
  label,
  error,
  value,
  options,
  unavailableOptions,
  onSelect,
  onAddCustom,
  canAddCustom,
  disabled,
  placeholder,
}: Props) => {
  const [open, setOpen] = useState(false);

  const selectModal = useContext(SelectModalContext);
  useEffect(() => {
    if (!open || !selectModal) return;
    return selectModal.register();
  }, [open, selectModal]);

  const close = () => setOpen(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    close();
  };

  const handleAddCustom = async (custom: string) => {
    await onAddCustom?.(custom);
    onSelect(custom);
    close();
  };

  return (
    <>
      <View>
        <View pointerEvents="none">
          <AppTextInput
            label={label}
            value={value}
            error={error}
            editable={false}
            disabled={disabled}
          />
        </View>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={disabled ? undefined : () => setOpen(true)}
        />
      </View>
      <SelectSheet
        open={open}
        onClose={close}
        title={label ?? "Select"}
        options={options}
        value={value}
        onSelect={handleSelect}
        canAddCustom={canAddCustom}
        onAddCustom={handleAddCustom}
        unavailableOptions={unavailableOptions}
        searchPlaceholder={placeholder}
      />
    </>
  );
};

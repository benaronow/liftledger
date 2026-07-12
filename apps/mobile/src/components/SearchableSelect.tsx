import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
  /** Rendered just to the left of each option's value (e.g. a checkbox). */
  prefix?: (item: string) => ReactNode;
  /** Rendered on the right of each option, opposite its value (e.g. buttons). */
  trailing?: (item: string) => ReactNode;
  /**
   * Replaces the default text-input trigger. Receives a callback that opens the
   * sheet — lets callers use their own opener (e.g. a "Manage" button).
   */
  renderTrigger?: (open: () => void) => ReactNode;
  /**
   * When false, selecting or adding an option leaves the sheet open and does
   * not auto-select a freshly added value — the management (edit list) mode.
   * Defaults to true, the value-picker behavior.
   */
  dismissOnSelect?: boolean;
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
  prefix,
  trailing,
  renderTrigger,
  dismissOnSelect = true,
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
    if (dismissOnSelect) close();
  };

  const handleAddCustom = async (custom: string) => {
    await onAddCustom?.(custom);
    if (dismissOnSelect) {
      onSelect(custom);
      close();
    }
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
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
      )}
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
        renderItemLeft={prefix}
        renderItemRight={trailing}
        searchPlaceholder={placeholder}
      />
    </>
  );
};

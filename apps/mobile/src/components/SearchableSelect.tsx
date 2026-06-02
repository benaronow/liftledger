import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, RADIUS, SPACING } from "../theme";
import { LabeledInputContainer } from "./inputs/LabeledInputContainer";

interface Props {
  label?: string;
  value: string;
  options: string[];
  // Options that exist but can't be picked here (shown as a disabled "… is
  // unavailable" row when typed) — used by EditBlock's exercise pickers.
  unavailableOptions?: string[];
  onSelect: (value: string) => void;
  onAddCustom?: (value: string) => Promise<void>;
  canAddCustom?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Native replacement for web's SearchableSelect: a tappable field that opens a
// modal with a search box + filtered list, optionally allowing a custom entry.
export const SearchableSelect = ({
  label,
  value,
  options,
  unavailableOptions,
  onSelect,
  onAddCustom,
  canAddCustom,
  disabled,
  placeholder,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  const filteredOptions = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const trimmed = query.trim();

  const isUnavailable = useMemo(
    () =>
      trimmed !== "" &&
      (unavailableOptions?.some((o) => o.toLowerCase() === trimmed.toLowerCase()) ??
        false),
    [trimmed, unavailableOptions],
  );

  const isCustom = useMemo(
    () =>
      trimmed !== "" &&
      !isUnavailable &&
      !options.some((o) => o.toLowerCase() === trimmed.toLowerCase()),
    [trimmed, options, isUnavailable],
  );

  const showAddOrUnavailable = (canAddCustom ?? false) && (isCustom || isUnavailable);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (option: string) => {
    onSelect(option);
    close();
  };

  const handleAddCustom = async () => {
    setAddingCustom(true);
    try {
      await onAddCustom?.(trimmed);
      onSelect(trimmed);
    } catch {
      // Swallow — leave the field as-is, like web.
    }
    setAddingCustom(false);
    close();
  };

  return (
    <LabeledInputContainer label={label}>
      <Pressable
        style={[
          styles.field,
          { backgroundColor: disabled ? COLORS.textDisabled : "white" },
        ]}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <Text style={styles.value} numberOfLines={1}>
          {value || placeholder || ""}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.container} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <TextInput
              style={styles.search}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder ?? "Search..."}
              placeholderTextColor={COLORS.textDisabled}
              autoFocus
              autoCapitalize="none"
            />
            <FlatList
              data={filteredOptions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item}
              // Trailing space so the last option clears the home indicator /
              // screen curve, as part of the scroll content.
              contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.option,
                    { backgroundColor: item === value ? COLORS.primary : COLORS.dark },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </Pressable>
              )}
              ListFooterComponent={
                showAddOrUnavailable ? (
                  <Pressable
                    style={styles.addRow}
                    onPress={isUnavailable ? undefined : handleAddCustom}
                    disabled={isUnavailable}
                  >
                    {addingCustom ? (
                      <ActivityIndicator color={COLORS.primary} size="small" />
                    ) : (
                      <Text style={styles.addText}>
                        {isUnavailable
                          ? `"${trimmed}" is unavailable`
                          : `Add "${trimmed}"`}
                      </Text>
                    )}
                  </Pressable>
                ) : null
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </LabeledInputContainer>
  );
};

const styles = StyleSheet.create({
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 35,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  value: { flex: 1, fontSize: FONT.base, color: "black" },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: COLORS.dark,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.md,
    maxHeight: "60%",
  },
  search: {
    backgroundColor: "white",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: 40,
    borderRadius: RADIUS.md,
    fontSize: FONT.base,
    color: "black",
  },
  option: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  optionText: { fontSize: FONT.sm, color: "white" },
  addRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: "flex-start",
  },
  addText: { fontSize: FONT.sm, color: COLORS.primary },
});

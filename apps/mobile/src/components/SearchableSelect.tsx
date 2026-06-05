import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../providers/ThemeProvider";
import { FONT, RADIUS, SPACING } from "../theme";
import { LabeledInputContainer } from "./inputs/LabeledInputContainer";
import { DARK_COLORS } from "../../../../packages/shared/src/colors";

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
  const { colors } = useTheme();

  const filteredOptions = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const trimmed = query.trim();

  const isUnavailable = useMemo(
    () =>
      trimmed !== "" &&
      (unavailableOptions?.some(
        (o) => o.toLowerCase() === trimmed.toLowerCase(),
      ) ??
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

  const showAddOrUnavailable =
    (canAddCustom ?? false) && (isCustom || isUnavailable);

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
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 35,
          paddingHorizontal: SPACING.sm,
          borderRadius: RADIUS.md,
          backgroundColor: disabled ? colors.textDisabled : "white",
        }}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <Text style={{ flex: 1, fontSize: FONT.base, color: "black" }} numberOfLines={1}>
          {value || placeholder || ""}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.container} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        {/* The sheet is bottom-anchored, so the keyboard would otherwise cover
            it (and its search box) entirely — lift it above the keyboard. */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
            onPress={close}
          >
            <Pressable
              style={{
                borderTopLeftRadius: RADIUS.xl,
                borderTopRightRadius: RADIUS.xl,
                paddingTop: SPACING.md,
                maxHeight: "60%",
                backgroundColor: colors.dark,
              }}
              onPress={() => {}}
            >
              <TextInput
                style={{
                  backgroundColor: "white",
                  marginHorizontal: SPACING.md,
                  marginBottom: SPACING.sm,
                  paddingHorizontal: SPACING.sm,
                  height: 40,
                  borderRadius: RADIUS.md,
                  fontSize: FONT.base,
                  color: "black",
                }}
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder ?? "Search..."}
                placeholderTextColor={colors.textDisabled}
                autoFocus
                autoCapitalize="none"
              />
              <FlatList
                data={filteredOptions}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item}
                // Trailing space so the last option clears the home indicator /
                // screen curve, as part of the scroll content.
                contentContainerStyle={{
                  paddingBottom: insets.bottom + SPACING.md,
                }}
                renderItem={({ item }) => (
                  <Pressable
                    style={{
                      paddingVertical: SPACING.md,
                      paddingHorizontal: SPACING.lg,
                      backgroundColor:
                        item === value ? colors.primary : colors.dark,
                    }}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={{ fontSize: FONT.sm, color: "white" }}>{item}</Text>
                  </Pressable>
                )}
                ListFooterComponent={
                  showAddOrUnavailable ? (
                    <Pressable
                      style={{
                        paddingVertical: SPACING.md,
                        paddingHorizontal: SPACING.lg,
                        alignItems: "flex-start",
                      }}
                      onPress={isUnavailable ? undefined : handleAddCustom}
                      disabled={isUnavailable}
                    >
                      {addingCustom ? (
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
                      ) : (
                        <Text style={{ fontSize: FONT.sm, color: DARK_COLORS.primary }}>
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
        </KeyboardAvoidingView>
      </Modal>
    </LabeledInputContainer>
  );
};

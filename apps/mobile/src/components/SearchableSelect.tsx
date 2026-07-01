import Fuse from "fuse.js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  List,
  Searchbar,
  useTheme,
} from "react-native-paper";
import { FONT, SPACING } from "../theme";
import { AppTextInput } from "./inputs";
import { Sheet } from "./Sheet";

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
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const { colors } = useTheme();

  const selectModal = useContext(SelectModalContext);
  useEffect(() => {
    if (!open || !selectModal) return;
    return selectModal.register();
  }, [open, selectModal]);

  const fuse = useMemo(() => new Fuse(options, { threshold: 0.4 }), [options]);
  const filteredOptions = useMemo(
    () =>
      query.trim() === "" ? options : fuse.search(query).map((r) => r.item),
    [fuse, query, options],
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
      <Modal
        visible={open}
        onRequestClose={close}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <Sheet
          title={label ?? "Select"}
          actions={[{ label: "Done", onPress: close }]}
          keyboardAvoiding
        >
          <Searchbar
            testID="select-search"
            style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.sm }}
            inputStyle={{ color: colors.onSurface }}
            placeholderTextColor={colors.onSurfaceDisabled}
            value={query}
            onChangeText={setQuery}
            placeholder={
              placeholder ?? (canAddCustom ? "Enter or add..." : "Enter...")
            }
            autoFocus
            autoCapitalize="none"
          />
          <FlatList
            style={{ flex: 1 }}
            data={filteredOptions}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item}
            contentContainerStyle={{
              paddingBottom: insets.bottom + SPACING.md,
            }}
            renderItem={({ item }) => (
              <List.Item
                title={item}
                testID={`select-option-${item}`}
                titleStyle={{ color: colors.onSurface }}
                style={{
                  backgroundColor:
                    item === value ? colors.primary : colors.primaryContainer,
                }}
                onPress={() => handleSelect(item)}
              />
            )}
            ListFooterComponent={
              showAddOrUnavailable ? (
                <List.Item
                  testID="select-add-custom"
                  title={
                    addingCustom ? (
                      <View style={{ paddingVertical: SPACING.xs }}>
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
                      </View>
                    ) : isUnavailable ? (
                      `"${trimmed}" is unavailable`
                    ) : (
                      `Add "${trimmed}"`
                    )
                  }
                  titleStyle={{ color: colors.primary, fontSize: FONT.sm }}
                  onPress={isUnavailable ? undefined : handleAddCustom}
                  disabled={isUnavailable}
                />
              ) : null
            }
          />
        </Sheet>
      </Modal>
    </>
  );
};

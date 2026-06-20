import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  List,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from "../paper";
import { FONT, INPUT_HEIGHT, RADIUS, SPACING } from "../theme";
import { TextInput as RNTextInput } from "react-native";
import { SheetHeader } from "./SheetHeader";

interface Props {
  label?: string;
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

  const inputRef = useRef<RNTextInput | null>(null);

  return (
    <>
      <TextInput
        ref={inputRef}
        style={{ height: INPUT_HEIGHT }}
        outlineStyle={{ borderRadius: RADIUS.md }}
        label={label}
        mode="outlined"
        value={value}
        editable={false}
        disabled={disabled}
        onFocus={() => inputRef.current?.blur()}
        render={({ style, onLayout }) => (
          <Text
            style={style}
            onLayout={onLayout}
            numberOfLines={1}
            ellipsizeMode="tail"
            onPress={disabled ? undefined : () => setOpen(true)}
          >
            {value}
          </Text>
        )}
      />
      <Modal
        visible={open}
        onRequestClose={close}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: colors.dark }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              flex: 1,
              paddingTop:
                (Platform.OS === "android" ? insets.top : 0) + SPACING.md,
            }}
          >
            <SheetHeader
              title={label ?? "Select"}
              actions={[{ label: "Done", onPress: close }]}
            />
            <Searchbar
              style={{ marginHorizontal: SPACING.md, marginBottom: SPACING.sm }}
              inputStyle={{ color: "black" }}
              placeholderTextColor={colors.textDisabled}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder ?? "Search..."}
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
                  titleStyle={{ color: colors.text }}
                  style={{
                    backgroundColor:
                      item === value ? colors.primary : colors.dark,
                  }}
                  onPress={() => handleSelect(item)}
                />
              )}
              ListFooterComponent={
                showAddOrUnavailable ? (
                  <List.Item
                    title={
                      addingCustom ? (
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

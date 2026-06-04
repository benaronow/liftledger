import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { ReactNode, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FONT, RADIUS, SPACING } from "../../theme";
import { LabeledInputContainer } from "./LabeledInputContainer";

interface Props {
  label?: string;
  error?: string;
  value?: string;
  options: string[];
  includeEmptyOption?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  height?: number;
  renderEnd?: () => ReactNode;
}

const EMPTY_LABEL = "-- Select --";

// Native replacement for web's <FormSelect>: a tappable field that opens a
// bottom-anchored list of options in a Modal.
export const LabeledSelect = ({
  label,
  error,
  value,
  options,
  includeEmptyOption,
  onChange,
  disabled,
  height,
  renderEnd,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const select = (option: string) => {
    onChange?.(option);
    setOpen(false);
  };

  const listOptions = includeEmptyOption ? ["", ...options] : options;

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <Pressable
        style={[
          styles.field,
          {
            height: height ?? 35,
            backgroundColor: disabled ? COLORS.textDisabled : "white",
            ...(renderEnd
              ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
              : null),
          },
        ]}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <Text style={styles.value} numberOfLines={1}>
          {value || EMPTY_LABEL}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.container} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {label && <Text style={styles.sheetTitle}>{label}</Text>}
            <FlatList
              data={listOptions}
              keyExtractor={(item) => item || "__empty__"}
              // Trailing space so the last option clears the home indicator /
              // screen curve, as part of the scroll content.
              contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => select(item)}>
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item || EMPTY_LABEL}
                  </Text>
                  {item === value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.primary}
                    />
                  )}
                </Pressable>
              )}
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
    backgroundColor: COLORS.container,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    maxHeight: "60%",
  },
  sheetTitle: {
    color: "white",
    fontSize: FONT.base,
    fontWeight: "700",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  optionText: { fontSize: FONT.base, color: "white" },
  optionTextSelected: { fontWeight: "700", color: COLORS.primary },
});

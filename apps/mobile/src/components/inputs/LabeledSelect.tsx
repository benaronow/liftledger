import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../providers/ThemeProvider";
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
  const { colors } = useTheme();

  const select = (option: string) => {
    onChange?.(option);
    setOpen(false);
  };

  const listOptions = includeEmptyOption ? ["", ...options] : options;

  return (
    <LabeledInputContainer label={label} error={error} renderEnd={renderEnd}>
      <Pressable
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: SPACING.sm,
          borderRadius: RADIUS.md,
          height: height ?? 35,
          backgroundColor: disabled ? colors.textDisabled : "white",
          ...(renderEnd
            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            : null),
        }}
        onPress={disabled ? undefined : () => setOpen(true)}
        disabled={disabled}
      >
        <Text style={{ flex: 1, fontSize: FONT.base, color: "black" }} numberOfLines={1}>
          {value || EMPTY_LABEL}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.container} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={{
              borderTopLeftRadius: RADIUS.xl,
              borderTopRightRadius: RADIUS.xl,
              paddingVertical: SPACING.md,
              maxHeight: "60%",
              backgroundColor: colors.container,
            }}
            onPress={() => {}}
          >
            {label && (
              <Text
                style={{
                  color: "white",
                  fontSize: FONT.base,
                  fontWeight: "700",
                  paddingHorizontal: SPACING.lg,
                  paddingBottom: SPACING.sm,
                }}
              >
                {label}
              </Text>
            )}
            <FlatList
              data={listOptions}
              keyExtractor={(item) => item || "__empty__"}
              // Trailing space so the last option clears the home indicator /
              // screen curve, as part of the scroll content.
              contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
              renderItem={({ item }) => (
                <Pressable
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: SPACING.md,
                    paddingHorizontal: SPACING.lg,
                  }}
                  onPress={() => select(item)}
                >
                  <Text
                    style={{
                      fontSize: FONT.base,
                      color: "white",
                      ...(item === value ? { fontWeight: "700", color: "#0096FF" } : null),
                    }}
                  >
                    {item || EMPTY_LABEL}
                  </Text>
                  {item === value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={colors.primary}
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


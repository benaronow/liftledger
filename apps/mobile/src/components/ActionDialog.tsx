import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { FONT, RADIUS, SPACING } from "../theme";
import { ActionButton, Variant } from "./ActionButton";
import { useTheme } from "../providers/ThemeProvider";

export interface DialogAction {
  icon: ReactNode;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  variant?: Variant;
}

interface Props {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title: string;
  actions: DialogAction[];
  // When saving, the backdrop is inert (web used a static backdrop) so the user
  // can't dismiss mid-mutation.
  saving?: boolean;
}

export const ActionDialog = ({
  children,
  open,
  onClose,
  title,
  actions,
  saving,
}: Props) => {
  const { colors } = useTheme();
  return (
  <Modal
    visible={open}
    transparent
    animationType="fade"
    onRequestClose={saving ? undefined : onClose}
  >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
          paddingHorizontal: SPACING.xl,
        }}
        onPress={saving ? undefined : onClose}
      >
        <Pressable
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: RADIUS.md,
            overflow: "hidden",
          }}
          onPress={() => {}}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              padding: SPACING.sm,
              backgroundColor: colors.dark,
            }}
          >
            <Text style={{ fontSize: FONT.lg, fontWeight: "600", color: colors.text }}>{title}</Text>
          </View>
          <View
            style={{
              alignItems: "center",
              padding: SPACING.sm,
              gap: SPACING.sm,
              backgroundColor: colors.container,
              ...(actions.length === 0 && {
                borderBottomLeftRadius: RADIUS.md,
                borderBottomRightRadius: RADIUS.md,
              }),
            }}
          >
            {children}
          </View>
          {actions.length !== 0 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: SPACING.sm,
                padding: SPACING.sm,
                backgroundColor: colors.dark,
              }}
            >
              {actions.map((action, idx) => (
                <View key={idx} style={{ flex: 1 }}>
                  <ActionButton
                    icon={action.icon}
                    onPress={action.onPress}
                    disabled={action.disabled}
                    variant={action.variant}
                    height={55}
                  />
                </View>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </KeyboardAvoidingView>
  </Modal>
  );
};

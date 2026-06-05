import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
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
  const { colors, scheme } = useTheme();
  const dividerColor =
    scheme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
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
          backgroundColor: "rgba(0,0,0,0.6)",
          paddingHorizontal: SPACING.xl,
        }}
        onPress={saving ? undefined : onClose}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 320,
            borderRadius: RADIUS.xl,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Pressable
            style={{
              borderRadius: RADIUS.xl,
              overflow: "hidden",
              backgroundColor: colors.background,
            }}
            onPress={() => {}}
          >
            <View
              style={{
                alignItems: "center",
                padding: SPACING.lg,
                gap: SPACING.md,
              }}
            >
              <Text
                style={{
                  fontSize: FONT.lg,
                  fontWeight: "700",
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <View style={{ width: "100%", alignItems: "center", gap: SPACING.sm }}>
                {children}
              </View>
            </View>
            {actions.length !== 0 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: SPACING.sm,
                  paddingHorizontal: SPACING.lg,
                  paddingBottom: SPACING.lg,
                  paddingTop: SPACING.md,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: dividerColor,
                }}
              >
                {actions.map((action, idx) => (
                  <View key={idx} style={{ flex: 1 }}>
                    <ActionButton
                      icon={action.icon}
                      onPress={action.onPress}
                      disabled={action.disabled}
                      variant={action.variant}
                      height={44}
                    />
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  </Modal>
  );
};

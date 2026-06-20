import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "../paper";
import { FONT, SPACING } from "../theme";

interface Props {
  // Custom body. Most confirmations only need `description`/`emphasis`; pass
  // children for richer content (an input, an error line, …) — they render
  // below the standard lines.
  children?: ReactNode;
  // The standard two-line confirmation body: a normal lead line and a bold
  // line beneath it.
  description?: string;
  emphasis?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  // MaterialCommunityIcons name shown above the title, tuned to each dialog's
  // intent (no icon if omitted). `destructive` tints it (and signals an
  // irreversible action) — pass "alert" + destructive for deletes/quits.
  icon?: string;
  destructive?: boolean;
  onConfirm: () => void;
  confirming?: boolean;
  confirmationDisabled?: boolean;
  action?: string;
  hideActions?: boolean;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
  secondaryActionDisabled?: boolean;
}

export const ConfirmationDialog = ({
  children,
  description,
  emphasis,
  open,
  onClose,
  title,
  icon,
  destructive,
  onConfirm,
  confirming,
  confirmationDisabled,
  action,
  hideActions,
  secondaryAction,
  onSecondaryAction,
  secondaryActionDisabled,
}: Props) => {
  const { colors } = useTheme();

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
        pointerEvents="box-none"
      >
        <Dialog
          visible={open}
          onDismiss={onClose}
          dismissable={!confirming}
          dismissableBackButton={!confirming}
        >
          {/* Title with its icon inline to the right (rather than Paper's
              default centered icon-above-title "alert" layout). */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: SPACING.sm,
              marginTop: SPACING.lg,
              marginBottom: SPACING.md,
              paddingHorizontal: SPACING.lg,
            }}
          >
            <Text variant="headlineSmall" style={{ flexShrink: 1, textAlign: "center" }}>
              {title}
            </Text>
            {icon && (
              <MaterialCommunityIcons
                name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={24}
                color={destructive ? colors.danger : colors.primary}
              />
            )}
          </View>
          <Dialog.Content style={{ paddingBottom: SPACING.sm }}>
            <View style={{ width: "100%", gap: SPACING.sm }}>
              {description && (
                <Text style={{ color: colors.text, fontSize: FONT.base }}>
                  {description}
                </Text>
              )}
              {emphasis && (
                <Text
                  style={{
                    color: colors.text,
                    fontSize: FONT.base,
                    fontWeight: "700",
                  }}
                >
                  {emphasis}
                </Text>
              )}
              {children}
            </View>
          </Dialog.Content>
          {!hideActions && (
            <Dialog.Actions
              style={{
                gap: SPACING.sm,
                paddingTop: 0,
                paddingHorizontal: SPACING.lg,
                paddingBottom: SPACING.md,
              }}
            >
              <Button
                textColor={colors.danger}
                onPress={onClose}
                disabled={confirming}
              >
                Cancel
              </Button>
              <Button
                onPress={onConfirm}
                disabled={confirming || confirmationDisabled}
              >
                {action ?? "Confirm"}
              </Button>
              {secondaryAction && onSecondaryAction && (
                <Button
                  onPress={onSecondaryAction}
                  disabled={confirming || secondaryActionDisabled}
                >
                  {secondaryAction}
                </Button>
              )}
            </Dialog.Actions>
          )}
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
};

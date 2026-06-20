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
          <Dialog.Icon icon="alert" color={colors.danger} size={32} />
          <Dialog.Title style={{ textAlign: "center" }}>{title}</Dialog.Title>
          <Dialog.Content>
            <View
              style={{ width: "100%", marginTop: SPACING.sm, gap: SPACING.md }}
            >
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
                paddingHorizontal: SPACING.lg,
                paddingBottom: SPACING.lg,
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

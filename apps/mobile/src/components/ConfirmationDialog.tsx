import { ReactNode } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { FONT, RADIUS, SPACING } from "../theme";
import { TopSheet } from "./TopSheet";

const SKIP_GRAY = "#7D7D82";
const SKIP_GRAY_DISABLED = "#5C5C61";

interface Props {
  children?: ReactNode;
  description?: string;
  emphasis?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  destructive?: boolean;
  onConfirm: () => void;
  confirming?: boolean;
  confirmationDisabled?: boolean;
  action?: string;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
  secondaryActionDisabled?: boolean;
  secondaryActionLoading?: boolean;
}

export const ConfirmationDialog = ({
  children,
  description,
  emphasis,
  open,
  onClose,
  title,
  destructive,
  onConfirm,
  confirming,
  confirmationDisabled,
  action,
  secondaryAction,
  onSecondaryAction,
  secondaryActionDisabled,
  secondaryActionLoading,
}: Props) => {
  const { colors } = useTheme();

  return (
    <TopSheet open={open} onClose={onClose} dismissable={!confirming}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View>
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: SPACING.lg,
                paddingHorizontal: SPACING.lg,
              }}
            >
              <Text
                variant="headlineSmall"
                style={{ flexShrink: 1, textAlign: "center" }}
              >
                {title}
              </Text>
            </View>
            {(description || emphasis || children) && (
              <View
                style={{
                  width: "100%",
                  gap: SPACING.sm,
                  paddingVertical: SPACING.xl,
                }}
              >
                {description && (
                  <Text
                    style={{ color: colors.onSurface, fontSize: FONT.base }}
                  >
                    {description}
                  </Text>
                )}
                {emphasis && (
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontSize: FONT.base,
                      fontWeight: "700",
                    }}
                  >
                    {emphasis}
                  </Text>
                )}
                {children}
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: SPACING.sm,
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.md,
              paddingBottom: SPACING.md,
              backgroundColor: colors.secondaryContainer,
              borderBottomLeftRadius: RADIUS.xl,
              borderBottomRightRadius: RADIUS.xl,
            }}
          >
            <Button
              textColor={destructive ? colors.error : colors.primary}
              onPress={onClose}
              disabled={confirming}
            >
              Cancel
            </Button>
            {secondaryAction && onSecondaryAction && (
              <Button
                mode="contained"
                buttonColor={
                  secondaryActionDisabled ? SKIP_GRAY_DISABLED : SKIP_GRAY
                }
                textColor={
                  secondaryActionDisabled ? colors.onSurfaceDisabled : "white"
                }
                loading={secondaryActionLoading}
                onPress={
                  confirming || secondaryActionDisabled
                    ? undefined
                    : onSecondaryAction
                }
              >
                {secondaryAction}
              </Button>
            )}
            <Button
              mode="contained"
              buttonColor={destructive ? colors.error : colors.primary}
              textColor={destructive ? colors.onError : colors.onPrimary}
              loading={confirming && !secondaryActionLoading}
              onPress={confirming ? undefined : onConfirm}
              disabled={confirmationDisabled}
            >
              {action ?? "Confirm"}
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </TopSheet>
  );
};

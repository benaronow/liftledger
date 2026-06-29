import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Keyboard, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { FONT, SPACING } from "../theme";
import { TopSheet } from "./TopSheet";

interface Props {
  children?: ReactNode;
  description?: string;
  emphasis?: string;
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  destructive?: boolean;
  onConfirm: () => void;
  confirming?: boolean;
  confirmationDisabled?: boolean;
  action?: string;
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
  secondaryAction,
  onSecondaryAction,
  secondaryActionDisabled,
}: Props) => {
  const { colors } = useTheme();

  return (
    <TopSheet open={open} onClose={onClose} dismissable={!confirming}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ paddingHorizontal: SPACING.lg }}>
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
            <Text
              variant="headlineSmall"
              style={{ flexShrink: 1, textAlign: "center" }}
            >
              {title}
            </Text>
            {icon && (
              <MaterialCommunityIcons
                name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={24}
                color={destructive ? colors.error : colors.primary}
              />
            )}
          </View>
          {(description || emphasis || children) && (
            <View
              style={{
                width: "100%",
                gap: SPACING.sm,
                paddingVertical: SPACING.md,
              }}
            >
              {description && (
                <Text style={{ color: colors.onSurface, fontSize: FONT.base }}>
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: SPACING.sm,
              paddingTop: SPACING.sm,
              paddingBottom: SPACING.md,
            }}
          >
            <Button
              textColor={colors.error}
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
          </View>
        </View>
      </TouchableWithoutFeedback>
    </TopSheet>
  );
};

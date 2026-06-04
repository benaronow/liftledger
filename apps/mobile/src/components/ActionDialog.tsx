import { COLORS } from "@liftledger/shared";
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
}: Props) => (
  <Modal
    visible={open}
    transparent
    animationType="fade"
    onRequestClose={saving ? undefined : onClose}
  >
    {/* Lift the centered card above the keyboard when a body input is focused
        (EditSet reps/weight/note, EditExercise selects, etc.). On iOS "padding"
        shrinks the centering area so the card re-centers higher; Android's IME
        resize handles this on its own. */}
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable
        style={styles.backdrop}
        onPress={saving ? undefined : onClose}
      >
        {/* Stop card taps from bubbling to the backdrop's dismiss handler. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View
            style={[
              styles.body,
              actions.length === 0 && styles.bodyRoundedBottom,
            ]}
          >
            {children}
          </View>
          {actions.length !== 0 && (
            <View style={styles.footer}>
              {actions.map((action, idx) => (
                // Each action takes an equal share of the footer row.
                <View key={idx} style={styles.footerCell}>
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.sm,
    backgroundColor: COLORS.dark,
  },
  title: { color: "white", fontSize: FONT.lg, fontWeight: "600" },
  body: {
    alignItems: "center",
    padding: SPACING.sm,
    gap: SPACING.sm,
    backgroundColor: COLORS.container,
  },
  bodyRoundedBottom: {
    borderBottomLeftRadius: RADIUS.md,
    borderBottomRightRadius: RADIUS.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.dark,
  },
  footerCell: { flex: 1 },
});


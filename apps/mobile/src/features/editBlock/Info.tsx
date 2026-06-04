import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActionButton, Variant } from "../../components/ActionButton";
import { FONT, RADIUS, SPACING } from "../../theme";

export interface InfoAction {
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
}

interface Props {
  title: string;
  actions?: InfoAction[];
  disabledMessage?: string;
  children: ReactNode;
}

// A titled card with a body and a row of equal-width action buttons — the
// repeating unit for days (EditWeek) and exercises (EditDay). When
// disabledMessage is set, a dimming overlay covers the whole card.
export const Info = ({ title, actions, disabledMessage, children }: Props) => (
  <View style={styles.card}>
    <View style={styles.titleBar}>
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={styles.body}>{children}</View>
    {actions && actions.length > 0 && (
      <View style={styles.actionRow}>
        {actions.map((action, idx) => (
          <View key={idx} style={styles.actionCell}>
            <ActionButton
              icon={action.icon}
              onPress={action.onPress}
              disabled={action.disabled}
              variant={action.variant}
              height={40}
            />
          </View>
        ))}
      </View>
    )}
    {!!disabledMessage && (
      <View style={styles.overlay}>
        <View style={styles.warningCircle}>
          <Ionicons name="warning" size={26} color={COLORS.danger} />
        </View>
        <Text style={styles.overlayText}>{disabledMessage}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: RADIUS.md,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  titleBar: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xs,
    backgroundColor: COLORS.dark,
  },
  title: { color: "white", fontSize: FONT.base, fontWeight: "700" },
  body: {
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.container,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.dark,
  },
  actionCell: { flex: 1 },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  warningCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  overlayText: {
    flex: 1,
    color: "white",
    fontWeight: "700",
    fontSize: FONT.sm,
  },
});
